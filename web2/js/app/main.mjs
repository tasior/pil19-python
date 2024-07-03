import { html } from 'htm/preact';
import { Remote } from './pages/remote.mjs';
import { Blinds } from './pages/blinds.mjs';
import { SubMenu } from './submenu/submenu.mjs';
import { useEffect, useRef, useId, useState } from 'preact/hooks';
import { Menu } from './menu.mjs';
    
export function Main({  }) {
    const carouselId = useId();
    const menuId = useId();
    const carouselRef = useRef();
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(1);

    useEffect(() => {
        const carousel = new bootstrap.Carousel(carouselRef.current);
        window.carousel = carousel;
        carouselRef.current.addEventListener('slide.bs.carousel', event => {
            setCurrentCarouselIndex(event.to);
        });
    }, []);

    return html`
        <div class="container-xxl text-center h-100 position-relative">
            <div class="carousel slide h-100" data-bs-animation="50" id=${carouselId} ref=${carouselRef}>
                <div class="carousel-inner h-100">
                    <${Remote} />
                    <${Blinds} active="true" />
                </div>
            </div>
            <${SubMenu} menuId=${menuId} currentCarouselIndex=${currentCarouselIndex} />
        </div>
        <${Menu} id=${menuId} carouselId=${carouselId} currentCarouselIndex=${currentCarouselIndex} />
    `;
}