import { html } from 'htm/preact';
    
export function Auth({ status, deviceId, requestAuthorization }) {
    return status != 'authorized' ? html`
        <div id="auth-container" class="container-xxl text-center h-100 position-relative">
            <div class="row mb-3">
            <div class="col text-center border-bottom p-5">
                <p>Urządznie nie jest zautoryzowane.</p>
                <p>Device Id: <span>${deviceId}</span></p>
                ${status ? (
                    status == 'auth_requested' ?
                        html`<p id="pending-autorization">Oczekiwanie na autoryzację</p>` :
                        html`<button id="request-device-authorization" class="btn btn-warning" onClick=${async () => await requestAuthorization()}>Dodaj do urządzenie</button>`
                    ) : ''
                 }
            </div>
            </div>
        </div>
    ` : '';
}