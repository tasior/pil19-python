import { html } from 'htm/preact';
import { useRef, useId, useState } from 'preact/hooks';
    
export function Blinds({ active, socket }) {
    const modalId = useId();
    const modalRef = useRef();

    const [addState, setAddState] = useState({ channel: '', name: '' });

    const submitAdd = e => {
      console.log('submitAdd', addState);

      setAddState({ channel: '', name: '' });
      e.preventDefault();
    };

    return html`
        <div class="carousel-item h-100 ${active ? 'active': ''}" data-page="blinds">
          <div class=" overflow-auto h-100">
            <div class="row p-0 m-0">
              <div class="col col-12 fs-2 py-2 text-start border-bottom">
                <p class="fs-4 fw-light mt-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive-fill em-1" viewBox="0 0 16 16">
                    <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z">
                    </path>
                  </svg> Rolety
                </p>
              </div>
              <div class="col col-12 py-0 text-start">
                <div class="row gy-2 p-0 m-0">
                  <div class="col col-6 bg-secondary-subtle py-2">
                    <div class="p-2"><strong>00</strong> Wszystkie</div>
                  </div>
                  <div class="col col-6 bg-secondary-subtle py-2 text-end">

                    <button class="btn p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-broadcast em-1" viewBox="0 0 16 16">
                        <path d="M3.05 3.05a7 7 0 0 0 0 9.9.5.5 0 0 1-.707.707 8 8 0 0 1 0-11.314.5.5 0 0 1 .707.707zm2.122 2.122a4 4 0 0 0 0 5.656.5.5 0 1 1-.708.708 5 5 0 0 1 0-7.072.5.5 0 0 1 .708.708zm5.656-.708a.5.5 0 0 1 .708 0 5 5 0 0 1 0 7.072.5.5 0 1 1-.708-.708 4 4 0 0 0 0-5.656.5.5 0 0 1 0-.708zm2.122-2.12a.5.5 0 0 1 .707 0 8 8 0 0 1 0 11.313.5.5 0 0 1-.707-.707 7 7 0 0 0 0-9.9.5.5 0 0 1 0-.707zM10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                      </svg>
                    </button>
                    <button class="btn p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil em-1" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                      </svg>
                    </button>
                    <button class="btn p-2 text-danger">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3 em-1" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="col col-12 py-0 text-start">
                <div class="row gy-2 p-0 m-0">
                  <div class="col col-12" style="--bs-bg-opacity: .5;">
                    <button class="btn p-2" data-bs-toggle="modal" data-bs-target="#${modalId}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square em-1" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                      </svg> Dodaj
                    </button>
                  </div>
                </div>
              </div>
              <!-- MODAL -->
              <div class="modal" tabindex="-1" id=${modalId} >
                <form onSubmit=${submitAdd}>
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Dodaj rolete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <div class="form-floating"><span class="text-left text-danger error-message">Error</span></div>
                        <div class="form-floating pb-2">
                          <select class="form-select rounded-0" aria-label="Wybierz kanał" value=${addState.channel} onChange=${ e => setAddState({ ...addState, channel: e.currentTarget.value }) }>
                            ${[...Array(100).keys()].map( i => html`
                              <option value="${i}">${('0' + i).slice(-2)}</option>
                            `)}
                          </select>
                          <label for="add-channel-no">Wybierz kanał</label>
                        </div>

                        <div class="form-floating">
                          <input type="text" class="form-control rounded-0" value=${addState.name} onInput=${ e => setAddState({ ...addState, name: e.currentTarget.value }) } />
                          <label for="add-channel-name">Nazwa</label>
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="submit" class="btn btn-warning" data-bs-dismiss="modal" >Dodaj</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
    `;
}