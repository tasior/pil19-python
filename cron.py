__tasks__ = {}

def cron_add_schedule(id, schedule):
    pass

def cron_remove_schedule():
    pass

def cron_update_schedule():
    pass

async def cron_initialize(config):
    if config['enabled']:
        for id, schedule in config['schedules']:
            cron_add_schedule(id, schedule)