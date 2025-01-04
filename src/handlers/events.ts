import { cube } from '../game';
import { tutorial } from '../tutorial';
import { toggle_info, update_fontsize } from '../utils/ui';
import { touchStart, touchMove, touchEnd, touchCancel } from './touch';
import { status, setStatus } from '../store';

export function initEventHandlers(): void {
    document.body.addEventListener('touchstart', touchStart);
    document.body.addEventListener('touchmove', touchMove);
    document.body.addEventListener('touchend', touchEnd);
    document.body.addEventListener('touchcancel', touchCancel);
    document.body.addEventListener('keyup', keyup);
    window.addEventListener('resize', update_fontsize);
}

export function event_handler(ev: string): void {
    switch(status) {
        case 'infobox': {
            if (ev == 'tap' || ev == 'space') {
                toggle_info();
                setStatus('game');
            }
        }; break;
        case 'game': {
            if (ev == 'up' || ev == 'down' || ev == 'left' || ev == 'right') cube.make(ev);
        }; break;
        case 'hello': {
            if (ev == 'esc' || ev == 'tap' || ev == 'space') {
                toggle_info();
                setStatus('game');
            }
        }; break;
        case 'debug': {
            cube.rotate(ev);
        }; break;
        case 'tutorial-0': {
            if (ev == 'tap' || ev == 'space') {
                tutorial(1);
            }
            if (ev == 'esc' || ev == 'up') {
                toggle_info();
                setStatus('game');
            }
        }; break;
        case 'tutorial-1': {
            if (ev == 'up') {
                tutorial(2);
            }
        }; break;
        case 'tutorial-2': {
            if (ev == 'right') {
                tutorial(3);
            }
        }; break;
        case 'tutorial-3': {
            if (ev == 'up') {
                tutorial(4);
            }
        }; break;
        default: throw new Error('unexpected status: ' + status);
    }
}

export function keyup(ev: KeyboardEvent): void {
    const table: { [key: number]: string } = {
        27: 'esc',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    if (table[ev.which]) event_handler(table[ev.which]);
}

export { status }; 