import json

MODE_ADMIN = 'admin'
MODE_APP = 'app'

def read_config(file = b'./.config') -> dict:
    try:
        config_file = open(file, "r")
    except OSError:
        config_file = open(file, "w")

    try:
        config = json.loads(config_file.read())
    except ValueError:
        config = {}
        
    config_file.close()

    return config

def write_config(config, file = b'./.config'):
    config_file = open(file, "w")
    config_file.write(json.dumps(config))
    config_file.close()

def read_cron_config():
        return read_config(file=b'/.config_cron')

def write_cron_config(config):
    write_config(config=config, file=b'/.config_cron')