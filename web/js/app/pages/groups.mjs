import { html } from 'htm/preact';
import { useRef, useId, useState, useEffect, useMemo } from 'preact/hooks';

export function Groups({ active, socket, blinds, groups, refreshGroups }) {
    const modalId = useId();
    const modalRef = useRef();
    const [modal, setModal] = useState();

    const [group, setGroup] = useState({ id: '', name: '', blinds: [] });
    const [action, setAction] = useState(null);
    const [error, setError] = useState(null);
    const nextId = useMemo(() => groups.reduce((acc, g) => g.id > acc ? g.id : acc, 0) + 1, [groups]);

    const onShowModal = (action, group) => {
        setAction(action);
        setGroup(group);
        setError(null);
        modal.show();
    };

    const onSubmit = async e => {
        try {
          if (action == 'add' && (group.id == '' || group.name == '' || group.blinds.length == 0)) {
            throw 'Wybierz rolety i nazwę';
          }
          const response = await socket.send(`groups:${action}`, group);
          if (response.status == 'ERROR') {
            setError(response.error_message);
          } else {
            refreshGroups();
            modal.hide();
          }
        } catch(e) {
          setError(e);
        }
  
        e.preventDefault();
        return false;
    };

    useEffect(() => {
        setModal(new bootstrap.Modal(modalRef.current))
      }, [modalRef]);
    
    return html`
        <div class="carousel-item h-100 ${active ? 'active': ''}" data-page="groups">
          <div class=" overflow-auto h-100">
            <div class="row p-0 m-0">
              <div class="col col-12 fs-2 py-2 text-start border-bottom">
                <p class="fs-4 fw-light mt-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection-fill em-1" viewBox="0 0 16 16">
                    <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z">
                    </path>
                  </svg> Grupy
                </p>
              </div>
              <div class="col col-12 py-0 text-start">
                ${groups.map(group => html`
                    <div class="row gy-2 p-0 m-0">
                        <div class="col col-8 bg-secondary-subtle py-2">
                            <div class="p-2"><strong>${('0' + group.id).slice(-2)}</strong> ${group.name}</div>
                        </div>
                        <div class="col col-4 bg-secondary-subtle py-2 text-end">
                            <button class="btn p-2" onClick=${_ => onShowModal('edit', group)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil em-1" viewBox="0 0 16 16">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                            </svg>
                            </button>
                            <button class="btn p-2 text-danger" onClick=${_ => onShowModal('remove', group)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3 em-1" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                            </svg>
                            </button>
                        </div>
                        <div class="col col-12 bg-secondary-subtle mt-0">
                            <div class="border-top p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection-fill em-1" viewBox="0 0 16 16">
                                <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z">
                                </path>
                            </svg> [ ${group.blinds.map(id => blinds.find(b => b.id == id)).map((blind, i) => blind && html`${i > 0 && ', '}<strong>${('0' + blind.id).slice(-2)}</strong> ${blind.name}` )} ]
                            </div>
                        </div>
                    </div>
                ` )}
              </div>

              <div class="col col-12 py-0 text-start">
                <div class="row gy-2 p-0 m-0">
                  <div class="col col-12" style="--bs-bg-opacity: .5;">
                    <button class="btn p-2"  onClick=${_ => onShowModal('add', { id: nextId, name: '', blinds: [] })}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square em-1" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                      </svg> Dodaj
                    </button>
                  </div>
                </div>
              </div>
              <!-- MODAL -->
              <div class="modal" tabindex="-1" id=${modalId} ref=${modalRef}>
                <form onSubmit=${onSubmit}>
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${action == 'add' ? 'Dodaj' : (action == 'edit' ? 'Edytuj' : 'Usuń')} grupę</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${error ? html`<div class="form-floating pb-3 text-start">Błąd: <span class="text-danger error-message"><b>${error}</b><br/></span></div>` : ''}
                            <div class="form-floating pb-2">
                                <input type="text" class="form-control rounded-0" value=${nextId} disabled=${true} />
                                <label style="--bs-body-bg: transparent;">ID</label>
                            </div>

                            <div class="form-floating pb-2">
                                <select class="form-select rounded-0" aria-label="Wybierz rolety" size="5" multiple style="height: auto;" 
                                    onChange=${ e => setGroup({ ...group, blinds: [...e.currentTarget.options].reduce((acc, o) => {o.selected && acc.push(o); return acc;}, []).map(o => +o.value) }) }
                                    disabled=${['remove'].indexOf(action) > -1}
                                >
                                    ${blinds.map(b => html`
                                        <option 
                                            value="${b.id}"
                                            selected=${group.blinds.indexOf(+b.id) > -1}
                                        >${('0' + b.id).slice(-2)} ${b.name}</option>
                                    ` )}
                                </select>
                                <label>Wybierz rolety</label>
                            </div>

                            <div class="form-floating">
                                <input type="text" class="form-control rounded-0" 
                                    value=${group.name} 
                                    onInput=${ e => setGroup({ ...group, name: e.currentTarget.value }) }  
                                    disabled=${['remove'].indexOf(action) > -1}
                                />
                                <label style="--bs-body-bg: transparent;">Nazwa</label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-warning">${action == 'add' ? 'Dodaj' : (action == 'edit' ? 'Edytuj' : 'Usuń')}</button>
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