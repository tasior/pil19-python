import { html } from 'htm/preact';
    
export function Loading({ status }) {
    return html`
        <div class="container-xxl text-center h-100">
            <div class="row mb-3">
            <div class="col text-start border-bottom p-5">
                <div class="d-flex align-items-center">
                <span>Loading... ${status == 'Error' ? html`<span class="text-danger error-message">${status}</span>` : status}</span>
                <div class="spinner-border ms-auto em-1" role="status" aria-hidden="true" style="--bs-spinner-border-width: 0.1em;"></div>
                </div>
            </div>
            </div>
        </div>
    `;
}