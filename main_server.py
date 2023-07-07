from wifi import WiFi
from microdot_asyncio import Microdot, send_file, Request
from microdot_asyncio_websocket import with_websocket
from config import write_config
import json

def wlan_callback(event):
    global wlan
    print('[WiFi] {}'.format(event))
    if(event == 'connected'):
        print('[WiFi] IP: {}'.format(wlan.ip()))

wlan = WiFi(cb=wlan_callback)
app = Microdot()
app_config = {}

@app.route('/')
def index(request):
    return send_file('/web/index.html')

@app.route('/ws')
@with_websocket
async def ws(request: Request, ws):
    while True:
        print("X-Authorization: {}".format(request.cookies['X-Authorization']))
        cmd = await ws.receive()
        response = handle_cmd(json.loads(cmd))
        await ws.send(json.dumps(response))

@app.route('/<path:path>')
def static(request, path):
    return send_file('/web/{}'.format(path), max_age=31556926)

def config_save(cmd):
    global app_config
    config = cmd['data']
    write_config(config)
    app_config = config
    return { 'cmd': cmd['cmd'], 'status': 'OK' }

handlers = {
    'config:get': lambda _: app_config,
    'config:save': config_save,
}

def handle_cmd(cmd: dict):
    print(f'handle cmd: {cmd["cmd"]}')
    return handlers[cmd['cmd']](cmd)

def main_server(config, port=80, debug=True):
    global app_config
    app_config = config
    wlan.connect(app_config['wifi_ssid'], app_config['wifi_password'])
    app.run(port=port, debug=debug)