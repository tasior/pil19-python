from wifi import WiFi_AP
from microdot_asyncio import Microdot, send_file
from microdot_asyncio_websocket import with_websocket

def wlan_callback(event):
    print(event)

wlan = WiFi_AP(wlan_callback)
app = Microdot()

@app.route('/')
def index(request):
    return send_file('/web/config.html')

@app.route('/web/<path:path>')
def static(request, path):
    return send_file('/web/{}'.format(path))

@app.route('/ws')
@with_websocket
async def echo(request, ws):
    while True:
        cmd = await ws.receive()
        handle_cmd(cmd)
        await ws.send(cmd)

def handle_cmd(cmd):
    print(f'handle cmd: {cmd}')

def config_server(config, ssid='PicoW_Pil19', password='admin123', port=80, debug=True):
    wlan.up(ssid, password)
    app.run(port=port, debug=debug)