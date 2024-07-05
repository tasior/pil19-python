from machine import Pin, Timer
from rp2 import asm_pio, PIO, StateMachine
from time import sleep, sleep_us
from micropython import const

CMD_STOP = const(0x90)
CMD_UP = const(0xa0)
CMD_UP_LAMEL = const(0xb0)
CMD_DOWN = const(0xc0)
CMD_DOWN_LAMEL = const(0xd0)
CMD_PAIR = const(0xe0)

pil19_command = {
    'up': CMD_UP,
    'down': CMD_DOWN,
    'stop': CMD_STOP,
    'lamen_down': CMD_DOWN_LAMEL,
    'lamel_up': CMD_UP_LAMEL,
    'pair': CMD_PAIR
}

@asm_pio(set_init=PIO.OUT_HIGH)
def pil19_send_data_pio():
    wrap_target()
    pull(block)                           # 0
    out(null, 8)                          # 1
    set(pins, 0)                          # 2
    wait(0, pin, 0)                       # 3
    nop()                            [26] # 4
    label("5")
    set(pins, 1)                          # 5
    out(x, 1)                             # 6
    jmp(not_x, "12")                      # 7
    nop()                            [9]  # 8
    set(pins, 0)                          # 9
    nop()                            [3]  # 10
    jmp("15")                             # 11
    label("12")
    nop()                            [3]  # 12
    set(pins, 0)                          # 13
    nop()                            [10] # 14
    label("15")
    jmp(not_osre, "5")                    # 15
    set(pins, 1)                          # 16
    wrap()

class Pil19:

    __min_sleep_s__ = const(0.3)
    __min_sleep_s_lamel__ = const(1.25)

    @staticmethod
    def crc8(bytes, poly=0x07, init=0x00):
        crc = init
        for byte in bytes:
            crc = crc ^ byte
            for _ in range(8):
                crc <<= 1
                if crc & 0x0100:
                    crc ^= poly
                crc &= 0xFF
        return crc

    @staticmethod
    def command(channel, command):
        return Pil19.crc8([channel, command], poly=0x95, init=0xef) | (channel << 16) | (command << 8)
    
    def __init__(self, pio: int, rx_base: int, tx_base: int, data_base) -> None:
        self.tx_pin = Pin(tx_base, Pin.OUT, Pin.PULL_UP)
        self.rx_pin = Pin(rx_base, Pin.IN)
        self.timer = Timer()
        self.sm = StateMachine(pio, prog=pil19_send_data_pio, freq=100_000, set_base=Pin(data_base, Pin.OUT, Pin.PULL_UP), in_base=self.rx_pin)
        self.sm.active(1)

    def send(self, channel: int, action: str):
        self.send_raw(self.send_raw(Pil19.command((0x80 + channel), pil19_command[action])))

    def send_raw(self, command):
        self.timer.deinit()
        self.tx_pin.high()
        while self.rx_pin.value() == 0:
            pass
        sleep_us(30)
        self.tx_pin.low()
        self.timer.init(mode=Timer.ONE_SHOT, period=2_500, callback=lambda _: self.tx_pin.high())
        self.sm.put(command)

        if (command >> 8) & 0xFF in [0xb0, 0xd0]:
            sleep(Pil19.__min_sleep_s_lamel__)
        else:
            sleep(Pil19.__min_sleep_s__)
    
