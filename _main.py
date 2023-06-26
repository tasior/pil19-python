from config import read_config
from config_server import config_server
from main_server import main_server

config = read_config()
mode = config.get('mode', 'config')

config_server(config) if mode == 'config' else main_server(config)