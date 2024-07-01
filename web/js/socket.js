
function once(object, type, callback) {
    const _once = (e) => {
        callback(e);
        object.removeEventListener(type, _once);
    };
    object.addEventListener(type, _once);
}

function createWebSocket(deviceId, host, path) {
    var socket;

    function connect() {
        return new Promise((resolve, reject) => {
            try {
                document.cookie = 'X-Authorization=' + deviceId + '; path=/';
                socket = new WebSocket(`ws://${host}/${path}`);
                once(socket, 'open', (ev) => resolve(ev));
                once(socket, 'error', (ev) => reject(ev));
            } catch (e) {
                reject(e);
            }
        });
    }

    function send(command, data) {
        return new Promise((resolve, reject) => {
            once(socket, 'message', (ev) => resolve(JSON.parse(ev.data)));
            once(socket, 'error', (ev) => reject(ev));

            socket.send(JSON.stringify({
                cmd: command,
                data: data,
                deviceId: deviceId
            }));
        });
    }

    function listen(cmd, listener) {
        socket.addEventListener('message', (ev) => {
            const data  = JSON.parse(ev.data);
            if (data.cmd == cmd) {
                listener(cmd, data);
            }
        });
    }

    function on(event, listener) {
        socket.addEventListener(event, listener);
    }

    function off(event, listener) {
        socket.removeEventListener(event, listener);
    }

    return {
        connect,
        send,
        listen,
        on,
        off
    }
}