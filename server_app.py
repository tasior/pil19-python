import uasyncio as asyncio
import json
from server import IServer
from wifi import WiFi
from microdot_asyncio import Microdot, send_file, Request, abort
from microdot_asyncio_websocket import with_websocket
from config import write_config

app = Microdot()

class AppServer(IServer):

    def __init__(self, config, wlan, port, index_path) -> None:
        super().__init__(config, wlan, port, index_path)
        self.handlers = {
            'auth:check': lambda _: 'Authorized',
            'auth:request': self.cmd_auth_request,
            'config:get': lambda _: self.cmd_config_get,
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
        config = {}
        for key, value in self.config:
            if "password" in key: config[key] = "***"
            else: config[key] = value
        return config

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


# enable_debug = True
# def debug(msg):
#     global enable_debug
#     if enable_debug: print(msg)

# wlan: WiFi | None = None

# app_config = {}

# def authenticate_device(request: Request):
#     if 'deviceId' in request.args:
#         deviceId = request.args['deviceId']
#         try:
#             return [device for device in app_config['devices'] if device['id'] == deviceId][0]
#         except Exception as e:
#             return None
#     return None

# @app.route('/')
# def index(request):
#     return send_file('/web/index.html')

# @app.route('/ws')
# @with_websocket
# async def ws(request: Request, ws):
#     device = authenticate_device(request)
#     auth = False if device is None else False if device['status'] != 'authorized' else True
#     while True:
#         cmd = await ws.receive()
#         if type(cmd) is str:
#             response = handle_cmd(device, auth, json.loads(cmd))
#             await ws.send(json.dumps(response))

# @app.route('/<path:path>')
# def static(request, path):
#     return send_file('/web/{}'.format(path), max_age=31556926)

# def config_save(cmd):
#     global app_config
#     config = cmd['data']
#     write_config(config)
#     app_config = config
#     return ''

# def request_device_authorization(cmd):
#     global app_config
#     print(app_config)
#     app_config['devices'].append({
#         'id': cmd['deviceId'],
#         'name': '',
#         'status': 'auth_requested',
#     })
#     print(app_config)
#     write_config(app_config)
#     return 'OK'

# handlers = {
#     'auth:check': lambda _: 'Authorized',
#     'auth:request': request_device_authorization,
#     'config:get': lambda _: app_config,
#     'config:save': config_save,
# }

# def handle_cmd(device, auth: bool, cmd: dict):
#     debug(f'Handle cmd: {cmd["cmd"]}')
#     if auth or cmd['cmd'] == 'auth:request':
#         try:
#             if cmd['cmd'] not in handlers:
#                 return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 404, 'error_message': 'Unknown command' }
#             return { 'cmd': cmd['cmd'], 'status': 'OK', 'data': handlers[cmd['cmd']](cmd) }
#         except OSError as e:
#             return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': e.errno, 'error_message': e.strerror }
#         except Exception as e:
#             import sys
#             sys.print_exception(e) # type: ignore
#             return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 0, 'error_message': str(e) }
#     else:
#         return { 'cmd': cmd['cmd'], 'status': 'ERROR', 'error_code': 401, 'error_message': 'Unauthorized device', 'device': device }

# async def main_server(config, wlan, port=80, debug=True):
#     global app_config, enable_debug
#     app_config = config
#     enable_debug = debug
#     await app.start_server(port=port,debug=debug)