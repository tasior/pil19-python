import sys
import uasyncio as asyncio
from machine import soft_reset

from config import read_config, MODE_ADMIN
from pil19 import Pil19
from wifi import WiFi, WLAN_MODE_AP, WLAN_MODE_IF, EVENT_CONNECTING, EVENT_CONNECTED, EVENT_CONNECTION_ERROR, EVENT_DISCONNECT
from server_app import AppServer
from server_admin import AdminServer
from scheduler import Scheduler

wlan: WiFi | None = None

def on_wlan(wlan: WiFi, event, data = None):
    print('[Wlan] Event: {} {}'.format(event, data))
    if event == EVENT_CONNECTED:
        print('[Wlan] Connected. IP: {}'.format(wlan.ip()))

async def main(server_coro, scheduler: Scheduler):
    scheduler.start()
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
    
    rx_base = 13
    tx_base = 14
    dat_base = 15
    print('[Main] Initializing Pil19(0, rx: {}, tx: {}, dat: {})...'.format(rx_base, tx_base, dat_base))
    pil19 = Pil19(0, rx_base, tx_base, dat_base)

    print('[Main] Initializing cron...')
    config_cron_path = b'./.config_cron'
    scheduler = Scheduler(config_path=config_cron_path, pil19=pil19)
    scheduler.initialize()
    
    print('[Main] Initializing server...')
    if mode == MODE_ADMIN:
        server = AdminServer(config=config, pil19=pil19, wlan=wlan, port=80, index_path='/web/config.html')
    else:
        server = AppServer(config=config, pil19=pil19, scheduler=scheduler, wlan=wlan, port=80, index_path='/web/index.html')

    asyncio.run(main(server_coro=server.run(), scheduler=scheduler))
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
    print('[Main] End')