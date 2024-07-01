from server import IServer

from microdot_asyncio import Request
from config import write_config
from machine import soft_reset

class AdminServer(IServer):

    def __init__(self, config, wlan, port, index_path) -> None:
        super().__init__(config, wlan, port, index_path)
        self.handlers = {
            'config:get': lambda _: self.config,
            'config:save': self.cmd_config_save,
            'wifi:scan': self.cmd_wifi_scan,
            'system:reset': lambda _: soft_reset()
        }

    def cmd_config_save(self, cmd):
        self.config = cmd['data']
        write_config(self.config)
        return 'OK'

    def cmd_wifi_scan(self, cmd):
        scan = set()
        for lan in self.wlan.wlan.scan():
            if lan[0] != b'':
                scan.add(lan[0].decode())
        return list(scan)
    
    def handle_cmd(self, request: Request, cmd):
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
