import { html } from 'htm/preact';
import { useRef, useId, useState, useEffect, useMemo } from 'preact/hooks';

export function Settings({ active, socket, addSystemTimeListener }) {
    const [boardTime, setBoardTime] = useState(null);
    const [deviceTime, setDeviceTime] = useState(null);
    
    const onSystemTime = (_, data) => {
        setBoardTime(new Date(data.data * 1000));
        setDeviceTime(new Date());
    };
    const systemTimeListener = useMemo(() => (onSystemTime), []);

    const syncTime = async () => {
        await socket.send('system:set_time', Math.floor(Date.now() / 1000));
    };

    useEffect(() => {
        addSystemTimeListener(systemTimeListener);
      }, []);

    return html`
        <div class="carousel-item h-100" data-page="ustawienia">
            <div class=" overflow-auto h-100">
                <div class="row p-0 m-0">
                    <div class="col col-12 fs-2 py-2 text-start border-bottom">
                        <p class="fs-4 fw-light mt-1 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection-fill em-1" viewBox="0 0 16 16">
                            <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z">
                            </path>
                            </svg> Ustawienia
                        </p>
                    </div>
                    <div class="col col-12 py-0 text-start">
                        <div class="row gy-2 p-0 m-0">
                            <div class="col col-8 bg-secondary-subtle py-2">
                                <div class="p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock em-1" viewBox="0 0 16 16">
                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                    </svg> Zegar systemowy
                                </div>
                            </div>
                            <div class="col col-4 bg-secondary-subtle py-2 text-end">
                                <button class="btn p-2" onClick=${e => syncTime()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat em-1" viewBox="0 0 16 16">
                                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                    <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="col col-12 bg-secondary-subtle mt-0">
                                <div class="border-top p-3">
                                    <strong>Czas urządzenia:</strong> <span>${boardTime && boardTime.toLocaleString()}</span><br />
                                    <strong>Aktualny czas:</strong> <span>${deviceTime && deviceTime.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}