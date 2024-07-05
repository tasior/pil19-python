import uasyncio as asyncio
from sched import schedule, cron
from config import read_config, write_config
from pil19 import Pil19
from time import localtime

class SchedulerTask:

    def __init__(self, id, enabled, schedule, func, *args) -> None:
        self.id = id
        self.enabled = enabled
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
                await schedule(self.func, *self.args, **self.schedule)
            except asyncio.CancelledError:
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
        blins = config.get('blinds', [])
        groups = config.get('groups', [])
        schedules = config.get('schedules', [])

        for schedule in schedules:
            self.tasks[schedule['id']] = self.create_task(**schedule, blinds=blins, groups=groups)

    def create_task(self, blinds, groups, id, enabled, schedule, target, targetId, action):
        def func(target, action):
            txt = 'fun target: {}, targetId: {}, action: {}'.format(target, targetId, action)
            yr, mo, md, h, m, s, wd = localtime()[:7]
            fst = 'Callback {} {:02d}:{:02d}:{:02d} on {:02d}/{:02d}/{:02d}'
            print(fst.format(txt, h, m, s, md, mo, yr))

        return SchedulerTask(id, enabled, schedule, func, target, action)

    def start(self):
        print('scheduler start')
        for id, task in self.tasks.items():
            print("Start task({})".format(id))
            if task.enabled:
                print('task start')
                task.start()

