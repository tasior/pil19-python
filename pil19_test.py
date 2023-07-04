from machine import Pin, Timer
import rp2
import time
from pil19 import pil19_init, pil19_send, pil19_command

rx_base = 6
tx_base = 7
dat_base = 8

pil19_init(0, rx_base, tx_base, dat_base)

# pil19_send(pil19_command(0x87, 0xc0))
# time.sleep(3)
pil19_send(pil19_command(0x87, 0x90))
for _ in range(10):
    pil19_send(pil19_command(0x87, 0xd0))
pil19_send(pil19_command(0x87, 0xa0))
