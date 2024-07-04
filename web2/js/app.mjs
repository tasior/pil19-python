import { createContext } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { html } from 'htm/preact';
import { createWebSocket } from './socket.mjs';
import { Loading } from './loading.mjs';
import { Auth } from './auth.mjs';
import { Main } from './app/main.mjs';

const AppContext = createContext({});

function App(props) {
    const deviceId = props.deviceId;
    const wsUrl = props.wsUrl;
    const socket = useMemo(() => createWebSocket(deviceId, wsUrl), []);
    const [socketState, setSocketState] = useState('Not Initialized');
    const [authStatus, setAuthStatus] = useState(null);
    const [systemTimeListeners, setSystemTimeListeners] = useState([]);
    const [systemTimeRegisteredListeners, setSystemTimeRegisteredListeners] = useState([]);
    const notRegisteredSystemTimeListeners = useMemo(() => systemTimeListeners.filter(e => !systemTimeRegisteredListeners.includes(e)), [systemTimeListeners]);

    const [context, setContext] = useState({ deviceId: deviceId, device: null, authorized: false });

    const initializeWebSocket = async () => {
        try {
            setSocketState('Connecting');
            await socket.connect();
            setSocketState('Connected');
            return true;
        } catch(e) {
            setSocketState('Error');
            return false;
        } 
    };

    const authenticate = async () => {
        const response = await socket.send('auth:check');
        setContext({ ...context, device: response.device, authorized: response.device?.status == "authorized" });
        setAuthStatus(response.device?.status);
    };

    const requestAuthorization = async () => {
        const response = await socket.send('auth:request');
        if (response.status == 'OK') {
            await authenticate();
        }
    }

    const addSystemTimeListener = (listener) => {
        if (systemTimeListeners.indexOf(listener) == -1) {
            setSystemTimeListeners([ ...systemTimeListeners, listener ])
        }
    };

    useEffect(async () => {
        if (await initializeWebSocket()) {
            await authenticate();
        }
    }, []);

    useEffect(() => {
        for (let i in notRegisteredSystemTimeListeners) {
            let listener = notRegisteredSystemTimeListeners[i];
            socket.listen('system:time', listener);
            setSystemTimeRegisteredListeners([ ...systemTimeRegisteredListeners, listener ]);
        }
    }, [systemTimeListeners]);

    return html`
        <${AppContext.Provider} value=${context}>
            ${socketState != 'Connected' ? 
                html`<${Loading} status=${socketState} />` : 
                authStatus && authStatus != "authorized" ? 
                    html`<${Auth} status=${authStatus} deviceId=${deviceId} requestAuthorization=${requestAuthorization} />` :
                    html`<${Main} socket=${socket} addSystemTimeListener=${addSystemTimeListener} />`
            }
        <//>
    `;
}

export {
    App, AppContext
}