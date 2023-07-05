import network, time

class WiFi:
    
    def __init__(self, cb, retries=10) -> None:
        self.retries = retries
        self.cb = cb
        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.active(True)
        self.wlan.config(pm = 0xa11140)

    def scan(self):
        self.wlan.scan()

    def connect(self, ssid, password):
        retries = self.retries
        self.wlan.connect(ssid, password)
        while retries > 0 and self.wlan.status() != network.STAT_GOT_IP:
            retries -= 1
            self.cb('connecting')
            time.sleep(1) 

        if not self.is_connected():
            self.cb('connection_error')
        else:
            self.cb('connected')

    def disconnect(self):
        self.disconnect()
        self.cb('disconnected')

    def is_connected(self):
        return self.wlan.status() == network.STAT_GOT_IP

    def ip(self):
        return self.wlan.ifconfig()[0]

class WiFi_AP:

    def __init__(self, cb) -> None:
        self.wlan = network.WLAN(network.AP_IF)
        self.cb = cb

    def up(self, ssid, password):
        self.wlan.config(ssid=ssid, password=password)
        self.wlan.active(True)

        while self.wlan.active() == False:
            self.cb('connecting')

        self.cb('connected')

    def down(self):
        self.wlan.deinit()
        self.cb('disconnected')

    def ip(self):
        return self.wlan.ifconfig()[0]