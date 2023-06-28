from config import read_config
from config_server import config_server
from main_server import main_server
from machine import soft_reset

try:
    print('boot...')
    print('read config...', end='')
    config = read_config()
    mode = config.get('mode', 'config')
    print('OK')
    print(f'running {mode} mode')
    config_server(config, debug=False) if mode == 'config' else main_server(config)
except:
    print('exception!!!')
    print('rebooting')
    soft_reset()