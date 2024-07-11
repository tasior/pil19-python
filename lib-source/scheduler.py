import uasyncio as asyncio
from sched import schedule, cron
from config import read_config, write_config
from pil19 import Pil19
from time import localtime, time, mktime
from cettime import cettime

def tz_cet(tnow):
    return mktime(cettime(tnow)) # type: ignore

def next_run(cron_schedule):
    return time() + cron(**cron_schedule)(time(), tz_cet)

class SchedulerTask:

    def __init__(self, id, enabled, schedule, func, *args) -> None:
        self.id = id
        self.enabled = enabled
        self.running = False
        self.schedule = schedule
        self.atask = None
        self.func = func
        self.args = args

    def start(self):
        async def task():
            try:
                print("schedule")
                print(self.args)
                print(self.schedule)
                self.running = True

                await schedule(self.func, *self.args, **self.schedule, tz=tz_cet)
            except asyncio.CancelledError:
                self.running = False
                print('task {} cancelled'.format(self.args))

        self.atask = asyncio.create_task(task())

    def stop(self):
        if self.atask is not None:
            self.atask.cancel() # type: ignore


class Scheduler:

    def __init__(self, config_path, pil19: Pil19) -> None:
        self.config_path = config_path
        self.pil19 = pil19
        self.tasks = {}

    def initialize(self):
        config = read_config(self.config_path)
        schedules = config.get('schedules', [])

        for schedule in schedules:
            self.add(schedule, False)

    def add(self, schedule, start=True):
        task = self.create_task(**schedule)
        self.tasks[task.id] = task

        if start and task.enabled:
            task.start()

    def remove(self, id):
        task = self.tasks.pop(id)
        if task is not None:
            if task.running:
                task.stop()
    
    def update(self, schedule):
        self.remove(schedule['id'])
        self.add(schedule)


    def create_task(self, id, enabled, schedule, target, targetId, action):
        config = read_config(self.config_path)
        blinds = config.get('blinds', [])
        groups = config.get('groups', [])

        def func(target, action):
            txt = 'fun target: {}, targetId: {}, action: {}'.format(target, targetId, action)
            yr, mo, md, h, m, s, wd = cettime()[:7]
            fst = 'Callback {} {:02d}:{:02d}:{:02d} on {:02d}/{:02d}/{:02d}'
            print(fst.format(txt, h, m, s, md, mo, yr))
            channels = [targetId] if target == 'blinds' else targetId
            for channel in channels:
                self.pil19.send(channel, action)

        return SchedulerTask(id, enabled, schedule, func, target, action)

    def start(self):
        print('scheduler start')
        for id, task in self.tasks.items():
            print("Start task({})".format(id))
            if task.enabled:
                print('task start')
                task.start()

    def stop(self):
        print('scheduler stop')
        for id, task in self.tasks.items():
            print("Stop task({})".format(id))
            if task.running:
                print('task stop')
                task.stop()
