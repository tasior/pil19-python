import { html } from 'htm/preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
    
let actionIconTimeout = null;
const weekDays = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'];

export function Remote({ active, blinds, groups, addSystemTimeListener }) {
  const [actionIcon, setActionIcon] = useState(null);
  const [boardTime, setBoardTime] = useState(null);

  const [target, setTarget] = useState('blinds');
  const [currentTarget, setCurrentTarget] = useState();
  const targetList = useMemo(() => target == 'blinds' ? blinds : groups, [target, blinds, groups]);

  const runRemoteControll = (id, action) => {
    clearTimeout(actionIconTimeout);
    
    console.log(id, action)
    setActionIcon(action);
    
    actionIconTimeout = setTimeout(() => setActionIcon(null) , 5000);
  };
  
  const onSystemTime = (_, data) => {
    setBoardTime(new Date(data.data * 1000));
  };
  const systemTimeListener = useMemo(() => (onSystemTime), []);

  useEffect(() => {
    const last = targetList.find(t => +t.id == +currentTarget?.id);

    if(last) {
      setCurrentTarget(last)
    } else if (targetList.length > 0){
      setCurrentTarget(targetList[0])
    } else {
      setCurrentTarget();
    };
  }, [targetList]);

  useEffect(() => {
    addSystemTimeListener(systemTimeListener);
  }, []);

  return html`
      <div class="carousel-item h-100 ${active ? 'active': ''}" data-page="remote">
        <div class="row text-center justify-content-center overflow-auto h-100">
          <div class="col col-9 col-md-4 col-xl-3 p-5">
            <div class="card border border-top-0 m-auto" data-bs-theme="light">
              <div class="card-header p-0 bg-dark-subtle" style="border: 1px solid white;border-width: 1px 10px 0 10px;">
                <div class="position-relative w-100 h-100" style="border: 1px solid black;border-width: 30px 10px 60px 10px;">
                  <div class="position-absolute start-0 w-100 h-100 translate-top z-3">
                    <select class="opacity-0 w-100 h-100" value=${currentTarget} onChange=${e => setCurrentTarget(targetList.find(t => +t.id == +e.currentTarget.value)) }>
                      ${targetList.map(t => html`
                        <option 
                          value=${t.id}
                          selected=${currentTarget && +t.id == +currentTarget.id}
                        >${('0' + t.id).slice(-2)} ${t.name}</option>  
                      ` )}
                    </select>
                  </div>
                  <div class="fw-bold text-secondary-emphasis">
                    <div class="row px-2">
                      <div class="col text-start">${boardTime ? `${('0' + boardTime.getHours()).slice(-2)}:${('0' + boardTime.getMinutes()).slice(-2)}` : `--:--`} </div>
                      <div class="col text-end">
                        ${actionIcon && actionIcon == 'up' ? html`
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-up blink" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708z"/>
                            <path fill-rule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                          </svg>
                        ` : ``}
                        ${actionIcon && actionIcon == 'down' ? html`
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-down blink" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                            <path fill-rule="evenodd" d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                          </svg>
                        ` : ``}
                        ${actionIcon && actionIcon == 'stop' ? html`
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-fill blink" viewBox="0 0 16 16">
                            <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
                          </svg>
                        ` : ``}

                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stopwatch ms-1" viewBox="0 0 16 16">
                          <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z"></path>
                          <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="row">
                      <div class="channel-no fw-semibold lh-1 py-2" style="font-size: 5.5rem!important;">${currentTarget && ('0' + currentTarget.id).slice(-2)}</div>
                    </div>
                    <div class="row px-2">
                      <div class="col col-12 pb-3 fw-light">
                        ${currentTarget && target == 'blinds' ? html`
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive-fill" viewBox="0 0 16 16">
                            <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z">
                            </path>
                          </svg> 
                          ` : html`
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection-fill em-1" viewBox="0 0 16 16">
                            <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z">
                            </path>
                          </svg> 
                          ` } <span class="channel-name">${currentTarget && currentTarget.name}</span>
                      </div>
                      <div class="col text-start">${boardTime ? weekDays[boardTime.getDay()] : '--'}</div>
                      <div class="col text-end"> ${ boardTime ? `${('0' + boardTime.getDate()).slice(-2)}/${('0' + boardTime.getMonth()+1).slice(-2)}/${boardTime.getFullYear()}` : `--/--/----` }</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="border: 1px solid white;border-width: 0 10px 0 10px;">
                <div class="vstack gap-1 py-2 px-1 border border-light-subtle">
                  <button type="button" class="btn btn-outline-secondary rounded-0 p-0 border border-light-subtle" onClick=${e => runRemoteControll(currentTarget.id, 'up')}>
                    <div class="w-100 p-2 text-secondary-emphasis border border-secondary-subtle border-top-0 border-start-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up em-2" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                      </svg>
                    </div>
                  </button>
                  <button type="button" class="btn btn-outline-secondary rounded-0 p-0 border border-light-subtle" onClick=${e => runRemoteControll(currentTarget.id, 'stop')}>
                    <div class="w-100 p-2 text-secondary-emphasis border border-secondary-subtle border-top-0 border-start-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop em-2" viewBox="0 0 16 16">
                        <path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5zM5 4.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5H5z"></path>
                      </svg>
                    </div>
                  </button>
                  <button type="button" class="btn btn-outline-secondary rounded-0 p-0 border border-light-subtle" onClick=${e => runRemoteControll(currentTarget.id, 'down')}>
                    <div class="w-100 p-2 text-secondary-emphasis border border-secondary-subtle border-top-0 border-start-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down em-2" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"></path>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
              <ul class="list-group list-group-flush border-top mt-5 pt-2">
                  <li class="list-group-item">
                      <div class="btn-group w-100" role="group" aria-label="Basic radio toggle button group" data-bs-theme="dark">
                      <input type="radio" class="btn-check" name="target" id="f1" autocomplete="off" checked=${target == 'blinds'} onChange=${e => setTarget('blinds')} />
                      <label class="btn btn-outline-dark rounded-0 border border-0" for="f1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive-fill" viewBox="0 0 16 16">
                            <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z">
                            </path>
                          </svg> Rolety
                      </label>

                      <input type="radio" class="btn-check" name="target" id="f2" autocomplete="off" checked=${target == 'groups'} onChange=${e => setTarget('groups')} />
                      <label class="btn btn-outline-dark rounded-0 border border-0" for="f2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection-fill" viewBox="0 0 16 16">
                            <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z">
                            </path>
                          </svg> Grupy
                      </label>
                      </div>
                  </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  `;
}