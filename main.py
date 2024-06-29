import sys
import uasyncio as asyncio
from machine import soft_reset
from time import sleep

from config import read_config, MODE_ADMIN
from wifi import WiFi, WLAN_MODE_AP, WLAN_MODE_IF, EVENT_CONNECTING, EVENT_CONNECTED, EVENT_CONNECTION_ERROR, EVENT_DISCONNECT
# from config_server import config_server
# from main_server import main_server

wlan: WiFi | None = None
server = None
cron = None

def on_wlan(wlan: WiFi, event, data = None):
    print('[Wlan] Event: {} {}'.format(event, data))
    if event == EVENT_CONNECTED:
        print('[Wlan] Connected. IP: {}'.format(wlan.ip()))

async def main(wlan: WiFi, server, cron):
    pass

try:
    print('[Main] Boot')
    print('[Main] Reading config...', end='')
    config = read_config()
    mode = config.get('mode', 'admin')
    print('OK')
    print('[Main] Mode: {}'.format(mode))
    
    print('[Main] Initializing WLAN...')
    wlan = WiFi(mode=WLAN_MODE_AP if config == MODE_ADMIN else WLAN_MODE_IF)
    wlan.add_listener(on_wlan)
    wlan_ssid = config['wifi_ap_ssid'] if mode == MODE_ADMIN else config['wifi_ssid']
    wlan_password = config['wifi_ap_password'] if mode == MODE_ADMIN else config['wifi_password']
    if not wlan.connect(wlan_ssid, wlan_password):
        raise RuntimeError('Cannot connect to wifi')

    asyncio.run(main(wlan=wlan, server=None, cron=None))
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