import network, time

EVENT_CONNECTING = b'connecting'
EVENT_CONNECTION_ERROR = b'connection_error'
EVENT_CONNECTED = b'connected'
EVENT_DISCONNECT = b'disconnected'

WLAN_MODE_AP = network.AP_IF
WLAN_MODE_IF = network.STA_IF

class WiFi:

    def __init__(self, callback = lambda: None, mode = network.STA_IF, retry_count = 20) -> None:
        self.mode = mode
        self.callback = callback
        self.retry_count = retry_count
        self.wlan = network.WLAN(self.mode)
        if mode == network.STA_IF:
            self.wlan.active(True)
            self.wlan.config(pm = 0xa11140)
    
    def scan(self):
        return self.wlan.scan()
    
    def connect(self, ssid, password):
        if self.mode == WLAN_MODE_AP:
            self.wlan.config(ssid=ssid, password=password)
            self.wlan.active(True)
            while self.wlan.active() == False:
                self.callback(self, EVENT_CONNECTING)
            self.callback(self, EVENT_CONNECTED)
        else:
            retries = self.retry_count
            self.wlan.connect(ssid, password)
            while retries > 0 and self.wlan.status() != network.STAT_GOT_IP:
                self.callback(self, EVENT_CONNECTING, retries)
                retries -= 1
                time.sleep(1) 

            self.callback(self, EVENT_CONNECTION_ERROR) if not self.is_connected() else self.callback(self, EVENT_CONNECTED)

    def disconnect(self):
        if self.mode == WLAN_MODE_AP:
            self.wlan.deinit()
        else:
            self.wlan.disconnect()
        self.callback(self, EVENT_DISCONNECT)

    def is_connected(self):
        return self.wlan.status() == network.STAT_GOT_IP

    def ip(self):
        return self.wlan.ifconfig()[0]

class WiFi_old:
    
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
            self.cb(EVENT_CONNECTING)
            time.sleep(1) 

        self.cb(EVENT_CONNECTION_ERROR) if not self.is_connected() else self.cb(EVENT_CONNECTED)

    def disconnect(self):
        self.wlan.disconnect()
        self.cb(EVENT_DISCONNECT)

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