import { html } from 'htm/preact';
import { Remote } from './pages/remote.mjs';
import { Blinds } from './pages/blinds.mjs';
import { SubMenu } from './submenu/submenu.mjs';
import { useEffect, useRef, useId, useState } from 'preact/hooks';
import { Menu } from './menu.mjs';
import { Groups } from './pages/groups.mjs';
import { Schedules } from './pages/schedules.mjs';
    
export function Main({ socket, addSystemTimeListener }) {
    const carouselId = useId();
    const menuId = useId();
    const carouselRef = useRef();
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(3);

    const [blinds, setBlinds] = useState([]);
    const [groups, setGroups] = useState([]);
    const [schedules, setSchedules] = useState([]);

    const refreshTarget = (target, set) => {
        return async () => {
            const response = await socket.send(`${target}:list`);
            if (response.status == 'OK') {
                set(response.data);
            } else {
                console.log('refreshTarget error', response);
            }
        };
    };
    const refreshBlinds = refreshTarget('blinds', setBlinds);
    const refreshGroups = refreshTarget('groups', setGroups);
    const refreshSchedules = refreshTarget('schedules', setSchedules);

    useEffect(() => {
        carouselRef.current.addEventListener('slide.bs.carousel', event => {
            setCurrentCarouselIndex(event.to);
        });

        refreshBlinds();
        refreshGroups();
        refreshSchedules();
    }, []);

    return html`
        <div class="container-xxl text-center h-100 position-relative">
            <div class="carousel slide h-100" data-bs-animation="50" id=${carouselId} ref=${carouselRef}>
                <div class="carousel-inner h-100">
                    <${Remote} socket=${socket} blinds=${blinds} groups=${groups} addSystemTimeListener=${addSystemTimeListener} />
                    <${Blinds} socket=${socket} blinds=${blinds} setBlinds=${setBlinds} refreshBlinds=${refreshBlinds} />
                    <${Groups} socket=${socket} blinds=${blinds} groups=${groups} refreshGroups=${refreshGroups} />
                    <${Schedules} active="true" socket=${socket} schedules=${schedules} blinds=${blinds} groups=${groups} refreshSchedules=${refreshSchedules}  />
                </div>
            </div>
            <${SubMenu} menuId=${menuId} currentCarouselIndex=${currentCarouselIndex} />
        </div>
        <${Menu} id=${menuId} carouselId=${carouselId} currentCarouselIndex=${currentCarouselIndex} />
    `;
}