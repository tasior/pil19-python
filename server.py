from microdot_asyncio import Microdot, send_file, Request, Response
from microdot_asyncio_websocket import with_websocket, WebSocket
import json
from pil19 import Pil19

Response.types_map['mjs'] = 'application/javascript'

class IServer:
        
    @staticmethod
    async def route_static(request: Request, path):
        return send_file('/web/{}'.format(path), max_age=31556926)

    def create_route_index(self, index_path):
        async def route_index(request: Request):
            return send_file(index_path)
        return route_index
    
    def create_ws_route(self):
        async def ws_route(request: Request, ws: WebSocket):
            self.ws_clients.append(ws)
            while True:
                try:
                    cmd = await ws.receive()
                    if type(cmd) is str:
                        response = await self.handle_cmd(request, json.loads(cmd))
                        await ws.send(json.dumps(response))
                except OSError as exc:
                    if exc.errno in [32, 54, 104]:  # pragma: no cover
                        self.ws_clients.remove(ws)
                        raise
        return ws_route

    def __init__(self, config, pil19: Pil19, wlan, port, index_path) -> None:
        self.app = Microdot()
        self.config = config
        self.pil19 = pil19
        self.wlan = wlan
        self.port = port
        self.is_debug_enabled = config.get('enable_debug', True) == True
        self.ws_clients = []

        self.app.route('/')(self.create_route_index(index_path=index_path))
        ws_route = self.create_ws_route()
        self.app.route('/ws')(with_websocket(ws_route))
        self.app.route('/<path:path>')(IServer.route_static)

    async def handle_cmd(self, request: Request, cmd):
        pass

    async def broadcast(self, message):
        for ws in self.ws_clients:
            await ws.send(json.dumps(message))

    async def run(self):
        await self.app.start_server(port=self.port, debug=self.is_debug_enabled)
    
    def debug(self, message):
        if self.is_debug_enabled: print(message)

    