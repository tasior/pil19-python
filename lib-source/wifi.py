import network, time

EVENT_CONNECTING = b'connecting'
EVENT_CONNECTION_ERROR = b'connection_error'
EVENT_CONNECTED = b'connected'
EVENT_DISCONNECT = b'disconnected'

WLAN_MODE_AP = network.AP_IF
WLAN_MODE_IF = network.STA_IF

class WiFi:

    def __init__(self, mode = network.STA_IF, retry_count = 20) -> None:
        self.mode = mode
        self.listeners = []
        self.retry_count = retry_count
        self.wlan = network.WLAN(self.mode)
        if mode == network.STA_IF:
            self.wlan.active(True)
            self.wlan.config(pm = 0xa11140)
    
    def add_listener(self, listener):
        self.listeners.append(listener)

    def fire(self, event, data = None):
        for listener in self.listeners:
            listener(self, event, data)

    def scan(self):
        return self.wlan.scan()
    
    def connect(self, ssid, password):
        if self.mode == WLAN_MODE_AP:
            self.wlan.config(ssid=ssid, password=password)
            self.wlan.active(True)
            while self.wlan.active() == False:
                self.fire(EVENT_CONNECTING)
        else:
            retries = self.retry_count
            self.wlan.connect(ssid, password)
            while retries > 0 and self.wlan.status() != network.STAT_GOT_IP:
                self.fire(EVENT_CONNECTING, retries)
                retries -= 1
                time.sleep(1) 

            if not self.is_connected():
                self.fire(EVENT_CONNECTION_ERROR) 
                return False
        
        self.fire(EVENT_CONNECTED)
        return True

    def disconnect(self):
        if self.mode == WLAN_MODE_AP:
            self.wlan.deinit()
        else:
            self.wlan.disconnect()
        self.fire(EVENT_DISCONNECT)

    def is_connected(self):
        return self.wlan.status() == network.STAT_GOT_IP

    def ip(self):
        return self.wlan.ifconfig()[0]
