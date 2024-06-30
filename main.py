import sys
import uasyncio as asyncio
from machine import soft_reset
from time import sleep

from config import read_config, MODE_ADMIN
from wifi import WiFi, WLAN_MODE_AP, WLAN_MODE_IF, EVENT_CONNECTING, EVENT_CONNECTED, EVENT_CONNECTION_ERROR, EVENT_DISCONNECT
from server_app import AppServer
# from config_server import config_server
# from main_server import main_server

wlan: WiFi | None = None

def on_wlan(wlan: WiFi, event, data = None):
    print('[Wlan] Event: {} {}'.format(event, data))
    if event == EVENT_CONNECTED:
        print('[Wlan] Connected. IP: {}'.format(wlan.ip()))

# async def server(i):
#     try:
#         while True:
#             print('[Server] loop {}'.format(i))
#             await asyncio.sleep(2)
#             asyncio.create_task(server(2))
#     except asyncio.CancelledError:
#         print('server task cancelled')

async def cron():
    while True:
        print('[Cron] loop')
        await asyncio.sleep(5)


async def main(server_coro, cron_coro):
    asyncio.create_task(cron_coro)
    await asyncio.create_task(server_coro) # type: ignore

try:
    print('[Main] Boot')
    print('[Main] Reading config...', end='')
    config = read_config()
    mode = config.get('mode', 'admin')
    print('OK')
    print('[Main] Mode: {}'.format(mode))
    
    print('[Main] Initializing WLAN...')
    wlan = WiFi(mode=WLAN_MODE_AP if mode == MODE_ADMIN else WLAN_MODE_IF)
    wlan.add_listener(on_wlan)
    wlan_ssid = config['wifi_ap_ssid'] if mode == MODE_ADMIN else config['wifi_ssid']
    wlan_password = config['wifi_ap_password'] if mode == MODE_ADMIN else config['wifi_password']
    print('[Main] WLAN connect({}, {})'.format(wlan_ssid, wlan_password))
    if not wlan.connect(wlan_ssid, wlan_password):
        raise RuntimeError('Cannot connect to wifi')
    
    print('[Main] Initializing server...')
    server = AppServer(config=config, wlan=wlan, port=80, index_path='/web/index.html')

    print('[Main] Initializing cron...')
    config_cron = read_config(b'./.config_cron')

    asyncio.run(main(server_coro=server.run(), cron_coro=cron()))
except Exception as e:
    print('[Main] Exception')
    sys.print_exception(e) # type: ignore
finally:
    print('[Main] Finally')
    if wlan is not None and wlan.is_connected():
        print('[Main] Wlan disconnect')
        wlan.disconnect()
    _ = asyncio.new_event_loop()
    # sleep(5)
    # soft_reset()