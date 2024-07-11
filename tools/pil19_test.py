from machine import Pin, Timer
import rp2
import time
from pil19 import Pil19, CMD_DOWN, CMD_UP, CMD_DOWN_LAMEL, CMD_STOP

rx_base = 18
tx_base = 17
dat_base = 16

pil19 = Pil19(0, rx_base, tx_base, dat_base)

print(1)
pil19.send(7, 'down')
print(2)
time.sleep(3)
print(2)
pil19.send(7, 'stop')
for _ in range(3):
    print(4)
    pil19.send(7, 'lamen_down')
print(5)
pil19.send(7, 'up')
print(6)
# pil19_init(0, rx_base, tx_base, dat_base)

# pil19_send(pil19_command(0x87, CMD_DOWN))
# time.sleep(3)
# pil19_send(pil19_command(0x87, CMD_STOP))
# for _ in range(3):
#     pil19_send(pil19_command(0x87, CMD_DOWN_LAMEL))
# pil19_send(pil19_command(0x87, CMD_UP))
