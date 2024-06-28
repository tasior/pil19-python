from machine import Pin, Timer
import rp2
import time
from pil19 import pil19_init, pil19_send, pil19_command, CMD_DOWN, CMD_UP, CMD_DOWN_LAMEL, CMD_STOP

rx_base = 13
tx_base = 14
dat_base = 15

pil19_init(0, rx_base, tx_base, dat_base)

pil19_send(pil19_command(0x87, CMD_DOWN))
time.sleep(3)
pil19_send(pil19_command(0x87, CMD_STOP))
for _ in range(10):
    pil19_send(pil19_command(0x87, CMD_DOWN_LAMEL))
pil19_send(pil19_command(0x87, CMD_UP))
