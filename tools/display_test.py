from machine import Pin, SoftI2C, RTC
from ssd1306 import SSD1306_I2C

pin = Pin("LED", Pin.OUT)
pin.high()

scl = Pin(15, mode=Pin.OUT, pull=Pin.PULL_UP)
sda = Pin(14, mode=Pin.OUT, pull=Pin.PULL_UP)
i2c = SoftI2C(scl, sda)

d = SSD1306_I2C(128, 64, i2c)
d.init_display()

rtc = RTC()

d.text(str(rtc.datetime()), 0, 0)
d.show()

pin.low()