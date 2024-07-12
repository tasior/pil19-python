from server import IServer
from microdot_asyncio import Request
from config import write_config, read_config, write_cron_config, read_cron_config
from machine import RTC
import uasyncio as asyncio
import time
from pil19 import Pil19, CMD_UP, CMD_STOP, CMD_DOWN, CMD_DOWN_LAMEL, CMD_UP_LAMEL, CMD_PAIR
from scheduler import Scheduler

class AppServer(IServer):

    def __init__(self, config: dict, pil19: Pil19, scheduler: Scheduler, wlan, port, index_path) -> None:
        super().__init__(config, pil19, wlan, port, index_path)
        self.handlers = {
            'auth:check': self.cmd_auth_check,
            'auth:request': self.cmd_auth_request,
            'config:get': self.cmd_config_get,
            'system:set_time': self.cmd_system_set_time,
            'blinds:list': self.cmd_blinds_list,
            'blinds:add': self.cmd_blinds_add,
            'blinds:edit': self.cmd_blinds_edit,
            'blinds:remove': self.cmd_blinds_remove,
            'groups:list': self.cmd_groups_list,
            'groups:add': self.cmd_groups_add,
            'groups:edit': self.cmd_groups_edit,
            'groups:remove': self.cmd_groups_remove,
            'remote:action': self.cmd_remote_action,
            'schedules:list': self.cmd_schedules_list,
            'schedules:add': self.cmd_schedules_add,
            'schedules:edit': self.cmd_schedules_edit,
            'schedules:remove': self.cmd_schedules_remove,
        }
        self.rtc = RTC()
        self.scheduler = scheduler

    async def run(self):
        asyncio.create_task(self.broadcast_time())
        return await super().run()

    async def broadcast_time(self):
        while True:
            await self.broadcast({ 'cmd': 'system:time', 'status': 'OK', 'data': time.time() })
            await asyncio.sleep(1)

    async def cmd_remote_action(self, cmd):
        target = cmd['data']['target']
        targetId = cmd['data']['targetId']
        action = cmd['data']['action']

        config = read_cron_config()
        target_config = config.get(target, [])
        try:
            i = next(i for i, _target in enumerate(target_config) if _target.get('id') == targetId)
            target_entry = target_config[i]
            target_channels = target_entry.get('blinds', target_entry.get('channel'))
            
            for channel in target_channels:
                self.debug("Pil19: {}, {}".format(channel, action))
                self.pil19.send(channel, action)

        except StopIteration:
            raise ValueError('{} not exists'.format(target[0].upper() + target[1:-1]))
        except Exception as e:
            raise e

        return 'OK'

    def target_list(self, target):
        cron_config = read_cron_config()
        return cron_config.get(target, [])

    async def cmd_blinds_list(self, _):
        return self.target_list('blinds')
    
    async def cmd_groups_list(self, _):
        return self.target_list('groups')
    
    async def cmd_schedules_list(self, _):
        return self.target_list('schedules')

    def target_add(self, target, data):
        cron_config = read_cron_config()
        target_data = cron_config.get(target, [])

        if data not in target_data:
            target_data.append(data)
            cron_config[target] = target_data
            write_cron_config(cron_config)
        else:
            raise ValueError('{} already exists'.format(target[0].upper() + target[1:-1]))

        return 'OK'

    async def cmd_blinds_add(self, cmd):
        return self.target_add('blinds', cmd['data'])
    
    async def cmd_groups_add(self, cmd):
        return self.target_add('groups', cmd['data'])

    async def cmd_schedules_add(self, cmd):
        schedule = cmd['data']
        self.scheduler.add(schedule)
        return self.target_add('schedules', schedule)

    def target_edit(self, target, data):
        cron_config = read_cron_config()
        target_data = cron_config.get(target, [])

        try:
            i = next(i for i, _target in enumerate(target_data) if _target.get('id') == data['id'])
            target_data[i] = data
            cron_config[target] = target_data
            write_cron_config(cron_config)
        except StopIteration:
            raise ValueError('{} not exists'.format(target[0].upper() + target[1:-1]))
        except Exception as e:
            raise e

        return 'OK'

    async def cmd_blinds_edit(self, cmd):
        return self.target_edit('blinds', cmd['data'])
    
    async def cmd_groups_edit(self, cmd):
        return self.target_edit('groups', cmd['data'])
    
    async def cmd_schedules_edit(self, cmd):
        schedule = cmd['data']
        self.scheduler.update(schedule)
        return self.target_edit('schedules', schedule)

    def target_remove(self, target, data):
        cron_config = read_cron_config()
        target_data = cron_config.get(target, [])

        try:
            target_data.remove(data)
            cron_config[target] = target_data
            write_cron_config(cron_config)
        except ValueError:
            raise ValueError('{} not exists'.format(target[0].upper() + target[1:-1]))
        except Exception as e:
            raise e

        return 'OK'

    async def cmd_blinds_remove(self, cmd):
        return self.target_remove('blinds', cmd['data'])
    
    async def cmd_groups_remove(self, cmd):
        return self.target_remove('groups', cmd['data'])

    async def cmd_schedules_remove(self, cmd):
        self.scheduler.remove(cmd['data']['id'])
        return self.target_remove('schedules', cmd['data'])

    async def cmd_system_set_time(self, cmd):
        timestamp = cmd['data']
        # (year, month, mday, hour, minute, second, weekday, yearday)
        local = time.localtime(timestamp)
        # (year, month, day, weekday, hours, minutes, seconds, subseconds)
        self.rtc.datetime(local[0:3] + tuple([local[6]]) + local[3:6] + tuple([0]))

        self.scheduler.stop()
        self.scheduler.start()

        return 'OK'

    async def cmd_auth_check(self, cmd):
        return 'Authorized'

    async def cmd_auth_request(self, cmd):
        self.debug('[MainServer] auth:request')
        self.config['devices'].append({
            'id': cmd['deviceId'],
            'name': '',
            'status': 'auth_requested',
        })
        write_config(self.config)
        await self.broadcast({ 'cmd': 'auth:requested', 'status': 'OK',  'data': None})
        return 'OK'

    async def cmd_config_get(self, cmd):
        filtered_config = {}
        for key, value in self.config.items():
            if "password" in key: filtered_config[key] = "***"
            else: filtered_config[key] = value
        return filtered_config

    def get_device_from_request(self, request: Request):
        if 'deviceId' in request.args:
            deviceId = request.args['deviceId']
            try:
                return [device for device in self.config['devices'] if device['id'] == deviceId][0]
            except Exception as e:
                return None
        return None
    
    def is_device_authenticated(self, device):
        return False if device is None else False if device['status'] != 'authorized' else True

    async def handle_cmd(self, request: Request, cmd):
        device = self.get_device_from_request(request=request)
        auth = self.is_device_authenticated(device=device)

        if device is None:
            device = { 'id': cmd['deviceId'], 'name': '', 'status': 'unauthorized' }

        if auth or cmd['cmd'] == 'auth:request':
            try:
                if cmd['cmd'] not in self.handlers:
                    return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 404, 'error_message': 'Unknown command', 'device': device }
                data = await self.handlers[cmd['cmd']](cmd)
                device = self.get_device_from_request(request=request)
                return { 'cmd': cmd['cmd'], 'status': 'OK', 'data': data, 'device': device }
            except OSError as e:
                return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': e.errno, 'error_message': e.strerror, 'device': device }
            except Exception as e:
                import sys
                sys.print_exception(e) # type: ignore
                return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 0, 'error_message': str(e), 'device': device }
        else:
            return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 401, 'error_message': 'Unauthorized device', 'device': device }
