import { InfoParams } from '../types/interfaces';
import { get_color } from './colors';
import { cube } from '../game';

export function toggle_info(params?: InfoParams): void {
    const DOM = {
        info: document.getElementById('info') as HTMLElement,
        top: document.getElementById('info_top') as HTMLElement,
        h1: document.getElementById('info_h1') as HTMLElement,
        p: document.getElementById('info_p') as HTMLElement
    };

    if (params) {
        DOM.top.innerHTML = params.top;
        DOM.h1.innerHTML = params.header.toString();
        DOM.p.innerHTML = params.text;
        DOM.info.style.backgroundColor = `rgba(${(params.color || get_color(params.header)).join(',')},0.5)`;
        DOM.info.style.display = 'block';
        setTimeout(() => { DOM.info.style.opacity = '1'; }, 0);
    } else {
        DOM.info.style.backgroundColor = '';
        DOM.info.style.opacity = '0';
        DOM.info.style.display = 'none';
        if (cube.end) cube.init();
    }
}

export function update_fontsize(): void {
    const W = window.innerWidth;
    const H = window.innerHeight;
    document.body.style.fontSize = ((W > H) ? H * 0.04 : W * 0.04) + 'px';
} 