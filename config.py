import json

MODE_ADMIN = b'admin'
MODE_APP = b'app'

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