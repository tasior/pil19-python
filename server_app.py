from server import IServer
from microdot_asyncio import Request
from config import write_config, read_config
from machine import RTC
import uasyncio as asyncio
import time

class AppServer(IServer):

    def __init__(self, config: dict, pil19, wlan, port, index_path) -> None:
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
        }
        self.rtc = RTC()

    async def run(self):
        asyncio.create_task(self.broadcast_time(self.rtc))
        return await super().run()

    async def broadcast_time(self, rtc: RTC):
        while True:
            await self.broadcast({ 'cmd': 'system:time', 'status': 'OK', 'data': time.time() })
            await asyncio.sleep(1)

    def read_cron_config(self):
        return read_config(file=b'/.confg_cron')

    def write_cron_config(self, config):
        write_config(config=config, file=b'/.confg_cron')

    async def cmd_blinds_list(self, cmd):
        cron_config = self.read_cron_config()
        return cron_config.get('blinds', [])
    
    async def cmd_blinds_add(self, cmd):
        cron_config = self.read_cron_config()
        blinds = cron_config.get('blinds', [])

        if cmd['data'] not in blinds:
            blinds.append(cmd['data'])
            cron_config['blinds'] = blinds
            self.write_cron_config(cron_config)
        else:
            raise ValueError('Blind already exists')

        return 'OK'
    
    async def cmd_blinds_edit(self, cmd):
        cron_config = self.read_cron_config()
        blinds = cron_config.get('blinds', [])

        try:
            i = next(i for i, blind in enumerate(blinds) if blind.get('id') == cmd['data']['id'])
            blinds[i] = cmd['data']
            cron_config['blinds'] = blinds
            self.write_cron_config(cron_config)
        except StopIteration:
            raise ValueError('Blind not exists')
        except Exception as e:
            raise e

        return 'OK'

    async def cmd_blinds_remove(self, cmd):
        cron_config = self.read_cron_config()
        blinds = cron_config.get('blinds', [])

        try:
            blinds.remove(cmd['data'])
            cron_config['blinds'] = blinds
            self.write_cron_config(cron_config)
        except ValueError:
            raise ValueError('Blind not exists')
        except Exception as e:
            raise e

        return 'OK'

    async def cmd_system_set_time(self, cmd):
        timestamp = cmd['data']
        # (year, month, mday, hour, minute, second, weekday, yearday)
        local = time.localtime(timestamp)
        # (year, month, day, weekday, hours, minutes, seconds, subseconds)
        self.rtc.datetime(local[0:3] + tuple([local[6]]) + local[3:6] + tuple([0]))
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
