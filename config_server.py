from wifi import WiFi_AP
from microdot_asyncio import Microdot, send_file
from microdot_asyncio_websocket import with_websocket
from config import write_config
import json

def wlan_callback(event):
    global wlan
    if(event == 'connected'):
        print('access point ready: {}'.format(wlan.ip()))

wlan = WiFi_AP(wlan_callback)
app = Microdot()
app_config = {}

@app.route('/')
def index(request):
    return send_file('/web/config.html')

@app.route('/<path:path>')
def static(request, path):
    return send_file('/web/{}'.format(path), max_age=31556926)

@app.route('/ws')
@with_websocket
async def ws(request, ws):
    while True:
        cmd = await ws.receive()
        response = handle_cmd(json.loads(cmd))
        await ws.send(json.dumps(response))

def wifi_scan(_):
    scan = set()
    for lan in wlan.wlan.scan():
        if lan[0] != b'':
            scan.add(lan[0].decode())
    return list(scan)

def config_save(cmd):
    global app_config
    config = cmd['data']
    write_config(config)
    app_config = config
    return { 'cmd': cmd['cmd'], 'status': 'OK' }

handlers = {
    'config:get': lambda _: app_config,
    'config:save': config_save,
    'wifi:scan': wifi_scan
}

def handle_cmd(cmd: dict):
    print(f'handle cmd: {cmd["cmd"]}')
    return handlers[cmd['cmd']](cmd)

def config_server(config, ssid='PicoW_Pil19', password='admin123', port=80, debug=True):
    global app_config
    app_config = config
    wlan.up(ssid, password)
    app.run(port=port, debug=debug)