
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
            once(socket, 'message', (ev) => resolve(ev.data, ev));
            once(socket, 'error', (ev) => reject(ev));

            socket.send(JSON.stringify({
                cmd: command,
                data: data,
                deviceId: deviceId
            }));
        });
    }

    return {
        connect,
        send
    }
}