import mm_wlan
from microdot_asyncio import Microdot, send_file
from microdot_asyncio_websocket import with_websocket
import uasyncio as asyncio
from machine import Timer

mm_wlan.connect_to_network('Hillton', 's13cg0rk0wa')

clients = []

app = Microdot()

@app.route('/')
def index(request):
    return send_file('./web/index.html')

@app.route('/echo')
@with_websocket
async def echo(request, ws):
    await send_hello(clients, len(clients))
    clients.append(ws)
    while True:
        data = await ws.receive()
        await ws.send(f'{len(clients)} - {data}')

async def send_hello(clients, len):
    print('sending hello')
    for client in clients:
        try:
            await client.send(f'Hello {len}')
        except OSError as ex:
            if ex.errno == 9:
                clients.remove(client)

async def main():
    await app.start_server(port=80, debug=True)

asyncio.run(main())