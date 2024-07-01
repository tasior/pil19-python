from server import IServer
from microdot_asyncio import Request
from config import write_config

class AppServer(IServer):

    def __init__(self, config: dict, wlan, port, index_path) -> None:
        super().__init__(config, wlan, port, index_path)
        self.handlers = {
            'auth:check': lambda _: 'Authorized',
            'auth:request': self.cmd_auth_request,
            'config:get': self.cmd_config_get,
        }

    def cmd_auth_request(self, cmd):
        self.debug(self.config)
        self.config['devices'].append({
            'id': cmd['deviceId'],
            'name': '',
            'status': 'auth_requested',
        })
        self.debug(self.config)
        write_config(self.config)
        return 'OK'

    def cmd_config_get(self, cmd):
        filtered_config = {}
        for key, value in self.config.items():
            if "password" in key: filtered_config[key] = "***"
            else: filtered_config[key] = value
        print(filtered_config)
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

    def handle_cmd(self, request: Request, cmd):
        device = self.get_device_from_request(request=request)
        auth = self.is_device_authenticated(device=device)

        if auth or cmd['cmd'] == 'auth:request':
            try:
                if cmd['cmd'] not in self.handlers:
                    return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 404, 'error_message': 'Unknown command' }
                return { 'cmd': cmd['cmd'], 'status': 'OK', 'data': self.handlers[cmd['cmd']](cmd) }
            except OSError as e:
                return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': e.errno, 'error_message': e.strerror }
            except Exception as e:
                import sys
                sys.print_exception(e) # type: ignore
                return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 0, 'error_message': str(e) }
        else:
            return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 401, 'error_message': 'Unauthorized device', 'device': device }
