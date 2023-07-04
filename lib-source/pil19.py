from machine import Pin, Timer
from rp2 import asm_pio, PIO, StateMachine
from time import sleep, sleep_us
from micropython import const

__initialized__ = False
__tx_pin__: Pin
__rx_pin__: Pin
__timer__: Timer
__sm__: StateMachine

__min_sleep_s__ = const(0.25)
__min_sleep__s_lamel__ = const(1.25)

CMD_STOP = const(0x90)
CMD_UP = const(0xa0)
CMD_UP_LAMEL = const(0xb0)
CMD_DOWN = const(0xc0)
CMD_DOWN_LAMEL = const(0xd0)
CMD_PAIR = const(0xe0)

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

def pil19_init(pio: int, rx_base: int, tx_base: int, data_base):
    global __tx_pin__, __rx_pin__, __timer__, __sm__, __initialized__

    if not __initialized__:
        PIO(pio).remove_program()
        __tx_pin__ = Pin(tx_base, Pin.OUT, Pin.PULL_UP)
        __rx_pin__ = Pin(rx_base, Pin.IN)
        __timer__ = Timer()
        __sm__ = StateMachine(pio, prog=pil19_send_data_pio, freq=100_000, set_base=Pin(data_base, Pin.OUT, Pin.PULL_UP), in_base=__rx_pin__)
        __sm__.active(1)
        __initialized__ = True

def pil19_send(cmd):
    __timer__.deinit()
    __tx_pin__.high()
    while __rx_pin__.value() == 0:
        pass
    sleep_us(30)
    __tx_pin__.low()
    __timer__.init(mode=Timer.ONE_SHOT, period=2_500, callback=lambda _: __tx_pin__.high())
    __sm__.put(cmd)
    if (cmd >> 8) & 0xFF in [0xb0, 0xd0]:
        sleep(__min_sleep__s_lamel__)
    else:
        sleep(__min_sleep_s__)

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

def pil19_command(channel, command):    
    return crc8([channel, command], poly=0x95, init=0xef) | (channel << 16) | (command << 8)