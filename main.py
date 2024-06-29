import sys
from machine import soft_reset
from config import read_config, MODE_ADMIN, MODE_APP
from wifi import WiFi, WiFi_AP, WLAN_MODE_AP, WLAN_MODE_IF, EVENT_CONNECTING, EVENT_CONNECTED, EVENT_CONNECTION_ERROR, EVENT_DISCONNECT
# from config_server import config_server
# from main_server import main_server

def wlan_callback(wlan: WiFi, event, data = None):
    print('[Wlan] Event: {} {}'.format(event, data))
    if event == EVENT_CONNECTED:
        print('[Wlan] Connected. IP: {}'.format(wlan.ip()))

wlan = None

try:
    print('[Main] Boot')
    print('[Main] Reading config...', end='')
    config = read_config()
    mode = config.get('mode', 'admin')
    print('OK')
    wlan = WiFi(callback=wlan_callback, mode=WLAN_MODE_AP if config == MODE_ADMIN else WLAN_MODE_IF)
    wlan.connect(config['wifi_ssid'], config['wifi_password'])
except Exception as e:
    print('[Main] Exception')
    sys.print_exception(e) # type: ignore
finally:
    if isinstance(wlan, WiFi) and wlan.is_connected():
        print('[Main] Wlan disconnect')
        wlan.disconnect()


# try:
#     print('boot...')
#     print('read config...', end='')
#     config = read_config()
#     mode = config.get('mode', 'config')
#     print('OK')
#     print(f'running {mode} mode')
#     config_server(config, debug=False) if mode == 'config' else main_server(config)
# except Exception as e:
#     print('exception!!!')
#     import sys
#     sys.print_exception(e) # type: ignore
#     print('rebooting')
#     # soft_reset()