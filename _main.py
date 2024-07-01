from config import read_config
from server_admin import config_server
from server_app import main_server
from machine import soft_reset

try:
    print('boot...')
    print('read config...', end='')
    config = read_config()
    mode = config.get('mode', 'admin')
    print('OK')
    print(f'running {mode} mode')
    config_server(config) if mode == 'admin' else main_server(config)
except Exception as e:
    print('exception!!!')
    print(e)
    print('rebooting')
    # soft_reset()