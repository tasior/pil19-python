# pil19-python

https://pypi.org/project/mpy-cross/

mpy-cross -march=armv6m wifi.py

mpy-cross -march=armv6m lib-source/microdot.py -o lib/microdot.mpy
mpy-cross -march=armv6m lib-source/microdot_asyncio.py -o lib/microdot_asyncio.mpy
mpy-cross -march=armv6m lib-source/microdot_asyncio_websocket.py -o lib/microdot_asyncio_websocket.mpy
mpy-cross -march=armv6m lib-source/microdot_websocket.py -o lib/microdot_websocket.mpy
mpy-cross -march=armv6m lib-source/pil19.py -o lib/pil19.mpy
mpy-cross -march=armv6m lib-source/ssd1306.py -o lib/ssd1306.mpy
mpy-cross -march=armv6m lib-source/wifi.py -o lib/wifi.mpy
mpy-cross -march=armv6m lib-source/cron.py -o lib/cron.mpy

https://docs.micropython.org/en/latest/reference/mpremote.html

copy to device:  
mpremote cp wifi.mpy :/lib/wifi.mpy
 copy from device:
 mpremote cp :/lib/wifi.mpy wifi.mpy 