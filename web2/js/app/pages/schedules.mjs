import { html } from 'htm/preact';
import { useRef, useId, useState, useEffect, useMemo } from 'preact/hooks';

const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

export function Schedules({ active, socket, blinds, groups, schedules, refreshSchedules }) {
    const modalId = useId();
    const modalRef = useRef();
    const [modal, setModal] = useState();

    const nextId = useMemo(() => schedules.reduce((acc, g) => g.id > acc ? g.id : acc, 0) + 1, [schedules]);
    const defaultSchedule = { 
      id: null, 
      enabled: true, 
      target: 'blinds', 
      targetId: blinds.length > 0 ? blinds[0].id: null, 
      action: 'up', 
      schedule: {
        wday: [...Array(7).keys()], hrs: 0, mins: 0, secs: 0
    } };
    const [schedule, setSchedule] = useState(defaultSchedule);
    const [action, setAction] = useState(null);
    const [error, setError] = useState(null);
    const targetList = useMemo(() => schedule.target == 'blinds' ? blinds : groups, [schedule]);

    const onShowModal = (action, schedule) => {
      setAction(action);
      setSchedule(schedule);
      setError(null);
      modal.show();
    };

    const onSubmit = async e => {
      e.preventDefault();
      console.log(schedule)
      try {
        if (action == 'add' && (!schedule.targetId || schedule.schedule.wday.length < 1)) {
          throw 'Uzupełnij wszystkie pola';
        }
        const response = await socket.send(`schedules:${action}`, schedule);
        if (response.status == 'ERROR') {
          setError(response.error_message);
        } else {
          refreshSchedules();
          modal.hide();
        }
      } catch(e) {
        setError(e);
      }

      
      return false;
    };

    const onChange = async (schedule, enabled) => {
      schedule.enabled = enabled;
      try {
        const response = await socket.send(`schedules:edit`, schedule);
        if (response.status == 'ERROR') {
          alert(response.error_message);
        } else {
          refreshSchedules();
        }
      } catch(e) {
        alert(e.message);
      } 
    };

    useEffect(() => {
      setModal(new bootstrap.Modal(modalRef.current))
    }, [modalRef]);

    return html`
        <div class="carousel-item h-100 ${active ? 'active': ''}" data-page="cron">
          <div class=" overflow-auto h-100">
            <div class="row p-0 m-0">
              <div class="col col-12 fs-2 py-2 text-start border-bottom">
                <p class="fs-4 fw-light mt-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar3 em-1" viewBox="0 0 16 16">
                    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
                    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                  </svg> Harmonogramy
                </p>
              </div>
              <div class="col col-12 py-0 text-start">
                ${schedules.map(s => html`
                  <div class="row gy-2 p-0 m-0 mt-2 ${s.enabled ? 'bg-secondary-subtle': 'bg-light-subtle' }">
                    <div class="col col-2 py-2 m-0">
                      <div class="p-2">
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" role="switch" checked=${s.enabled} onChange=${e => onChange(s, e.currentTarget.checked)} />
                        </div>
                      </div>
                    </div>
                    <div class="col col-5 py-2 m-0">
                      <figure class="m-0">
                        <blockquote class="blockquote fs-6 text-truncate">
                          ${('0' + s.schedule?.hrs).slice(-2)}:${('0' + s.schedule?.mins).slice(-2)}, ${s.schedule?.wday?.map((d, i) => html`${i > 0 && ', '}${weekDays[d]}`)}
                        </blockquote>
                        <figcaption class="blockquote-footer mb-0">
                          ${('0' + s.id).slice(-2)} ${ { 'up': 'Otwórz', 'down': 'Zamknij', 'stop': 'Zatrzymaj'}[s.action] } ${s.target == 'blinds' ? 'roletę' : 'grupę'}: ${('0' + s.targetId).slice(-2)}
                        </figcaption>
                      </figure>
                    </div>
                    <div class="col col-5 py-2 m-0 text-end">
                      <button class="btn p-2" data-bs-toggle="collapse" data-bs-target="#info-${s.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill em-1" viewBox="0 0 16 16">
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                        </svg>
                      </button>
                      <button class="btn p-2" onClick=${_ => onShowModal('edit', s)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil em-1" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                        </svg>
                      </button>
                      <button class="btn p-2 text-danger" onClick=${_ => onShowModal('remove', s)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3 em-1" viewBox="0 0 16 16">
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z" />
                        </svg>
                      </button>
                    </div>
                    <div class="col col-12 mt-0 collapse" id="info-${s.id}">
                      <div class="border-top p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection-fill em-1" viewBox="0 0 16 16">
                          <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z">
                          </path>
                        </svg> [ <strong>05</strong> Dzieci, <strong>06</strong> Sypialnia, <strong>07</strong> Biuro ]
                      </div>
                    </div>
                  </div>
                `)}
              </div>

              <div class="col col-12 py-0 text-start">
                <div class="row gy-2 p-0 m-0">
                  <div class="col col-12" style="--bs-bg-opacity: .5;">
                    <button class="btn p-2" onClick=${_ => onShowModal('add', { ...defaultSchedule, id: nextId, targetId: blinds.length > 0 ? blinds[0].id: null })}>
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
                        <h5 class="modal-title">${action == 'add' ? 'Dodaj' : (action == 'edit' ? 'Edytuj' : 'Usuń')} harmonogram</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        ${error ? html`<div class="form-floating pb-3 text-start">Błąd: <span class="text-danger error-message"><b>${error}</b><br/></span></div>` : ''}
                        <div class="form-floating pb-2">
                            <input type="text" class="form-control rounded-0" value=${schedule.id} disabled=${true} />
                            <label style="--bs-body-bg: transparent;">ID</label>
                        </div>
                        <div class="form-floating pb-2">
                          <select class="form-select rounded-0" style="height: auto;"
                            value=${schedule.target} 
                            onChange=${ e => setSchedule({ ...schedule, target: e.currentTarget.value, targetId: null }) }
                            disabled=${['remove'].indexOf(action) > -1}
                          >
                            <option value="blinds">Rolety</option>
                            <option value="groups">Grupy</option>
                          </select>
                          <label for="add-schedule-channels">Wybierz cel</label>
                        </div>

                        <div class="form-floating pb-2">
                          <select class="form-select rounded-0" style="height: auto;"
                            value=${schedule.targetId} 
                            onChange=${ e => setSchedule({ ...schedule, targetId: +e.currentTarget.value }) }
                            disabled=${['remove'].indexOf(action) > -1}
                          >
                            ${ targetList.map(t => html`<option value="${t.id}">${('0' + t.id).slice(-2)}  ${t.name}</option>`) }                            
                          </select>
                          <label for="add-schedule-channels">Wybierz ${schedule.target == 'blinds' ? 'roletę' : 'grupę'}</label>
                        </div>

                        <div class="form-floating pb-2">
                          <select class="form-select rounded-0" style="height: auto;"
                            value=${schedule.action} 
                            onChange=${ e => setSchedule({ ...schedule, action: e.currentTarget.value }) }
                            disabled=${['remove'].indexOf(action) > -1}
                          >
                            <option value="up">Otwórz</option>
                            <option value="down">Zamknij</option>
                            <option value="stop">Zatrzymaj</option>
                          </select>
                          <label for="add-schedule-channels">Wybierz akcję</label>
                        </div>

                        <div class="form-floating pb-2">
                          <select class="form-select rounded-0" size="5" multiple style="height: auto;" 
                            onChange=${ e => setSchedule({ ...schedule, schedule: { ...schedule.schedule, wday: [...e.currentTarget.options].reduce((acc, o) => {o.selected && acc.push(o); return acc;}, []).map(o => +o.value) } }) }
                            disabled=${['remove'].indexOf(action) > -1}
                          >
                            ${weekDays.map((d, i) => html`
                              <option value=${i} selected=${schedule && schedule.schedule.wday && schedule.schedule.wday.indexOf(i) > -1}>${d}</option>
                            `)}
                          </select>
                          <label for="add-schedule-channels">Wybierz dni tygodnia</label>
                        </div>

                        <div class="row pb-2">
                          <div class="col">
                            <div class="form-floating">
                              <select class="form-select rounded-0" 
                                value=${schedule.schedule.hrs}
                                onChange=${ e => setSchedule({ ...schedule, schedule: { ...schedule.schedule, hrs: +e.currentTarget.value } }) }
                                disabled=${['remove'].indexOf(action) > -1}
                              >
                                ${[...Array(24).keys()].map((v) => html`
                                  <option value=${v}>${v}</option>
                                `)}
                              </select>
                              <label for="add-schedule-channels">Godz.</label>
                            </div>
                          </div>
                          <div class="col">
                            <div class="form-floating">
                              <select class="form-select rounded-0" 
                                value=${schedule.schedule.mins}
                                onChange=${ e => setSchedule({ ...schedule, schedule: { ...schedule.schedule, mins: +e.currentTarget.value } }) }
                                disabled=${['remove'].indexOf(action) > -1}
                              >
                                ${[...Array(60).keys()].map((v) => html`
                                  <option value=${v}>${v}</option>
                                `)}
                              </select>
                              <label for="add-schedule-channels">Min.</label>
                            </div>
                          </div>
                          <div class="col">
                            <div class="form-floating">
                              <select class="form-select rounded-0" 
                                value=${schedule.schedule.secs}
                                onChange=${ e => setSchedule({ ...schedule, schedule: { ...schedule.schedule, secs: +e.currentTarget.value } }) }
                                disabled=${['remove'].indexOf(action) > -1}
                              >
                                ${[...Array(60).keys()].map((v) => html`
                                  <option value=${v}>${v}</option>
                                `)}
                              </select>
                              <label for="add-schedule-channels">Sek.</label>
                            </div>
                          </div>
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