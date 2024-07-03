import { html } from 'htm/preact';
import { RemoteSubMenu } from './remote.mjs';
    
export function SubMenu({ menuId, currentCarouselIndex }) {
    console.log('sub current', currentCarouselIndex)
    const subMenus = [RemoteSubMenu];

    return html`
        <div class="position-absolute bottom-0 end-0 p-4">
            ${subMenus.length > 0 &&
                subMenus.map((subMenu, i) => i == currentCarouselIndex ? html`<${subMenu} />`: '')
            }

            <button class="btn btn-warning position-relative" type="button" data-bs-toggle="offcanvas" data-bs-target="#${menuId}" aria-controls=${menuId}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                </svg>
                <div class="spinner-grow spinner-grow-sm text-danger position-absolute top-0 start-100 translate-middle" role="status" style="--bs-spinner-width: 0.5rem; --bs-spinner-height: 0.5rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </button>
        </div>
    `;
}