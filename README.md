# pil19-python

https://pypi.org/project/mpy-cross/

mpy-cross -march=armv6m wifi.py

mpy-cross -march=armv6m lib-source/cettime.py -o lib/cettime.mpy
mpy-cross -march=armv6m lib-source/microdot.py -o lib/microdot.mpy
mpy-cross -march=armv6m lib-source/microdot_asyncio.py -o lib/microdot_asyncio.mpy
mpy-cross -march=armv6m lib-source/microdot_asyncio_websocket.py -o lib/microdot_asyncio_websocket.mpy
mpy-cross -march=armv6m lib-source/microdot_websocket.py -o lib/microdot_websocket.mpy
mpy-cross -march=armv6m lib-source/pil19.py -o lib/pil19.mpy
mpy-cross -march=armv6m lib-source/sched.py -o lib/sched.mpy
mpy-cross -march=armv6m lib-source/scheduler.py -o lib/scheduler.mpy
mpy-cross -march=armv6m lib-source/ssd1306.py -o lib/ssd1306.mpy
mpy-cross -march=armv6m lib-source/wifi.py -o lib/wifi.mpy

https://docs.micropython.org/en/latest/reference/mpremote.html

copy to device:  
mpremote cp wifi.mpy :/lib/wifi.mpy
 copy from device:
 mpremote cp :/lib/wifi.mpy wifi.mpy 

mpremote cp lib/cettime.mpy :/lib/cettime.mpy
mpremote cp lib/microdot.mpy :/lib/microdot.mpy
mpremote cp lib/microdot_asyncio.mpy :/lib/microdot_asyncio.mpy
mpremote cp lib/microdot_asyncio_websocket.mpy :/lib/microdot_asyncio_websocket.mpy
mpremote cp lib/microdot_websocket.mpy :/lib/microdot_websocket.mpy
mpremote cp lib/pil19.mpy :/lib/pil19.mpy
mpremote cp lib/sched.mpy :/lib/sched.mpy
mpremote cp lib/scheduler.mpy :/lib/scheduler.mpy
mpremote cp lib/ssd1306.mpy :/lib/ssd1306.mpy
mpremote cp lib/wifi.mpy :/lib/wifi.mpy


SSL GEN:
$ openssl ecparam -name prime256v1 -genkey -noout -out ec_key.der -outform DER
$ openssl req -new -x509 -key ec_key.der -out ec_cert.der -outform DER -days 365 -nodes 