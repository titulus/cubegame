import { Cube } from './classes/Cube';
import { tutorial } from './tutorial';
import { update_fontsize, toggle_info } from './utils/ui';
import { setStatus } from './store';
import { getCookie, setCookie } from './utils/cookies';

export const cube = new Cube('cube3d');

export function init(state: string): void {
    switch (state) {
        case 'game': {
            cube.init();
            toggle_info({
                top: '',
                header: 'hello',
                text: 'press <span class="key">&larr;</span>,<span class="key">&uarr;</span>,<span class="key">&rarr;</span>,<span class="key">&darr;</span><br/>'
                    + 'or<br/>swipe <span class="touch">&larr;</span>,<span class="touch">&uarr;</span>,<span class="touch">&rarr;</span>,<span class="touch">&darr;</span>.<br/>'
                    + 'Chosen side will increased, if it equal to front, cube will rotate otherwise.<br/>'
                    + 'Press <span class="key">space</span> or <span class="touch">tap</span> to close info.',
                color: [125, 125, 255],
            });
            setStatus('infobox');
        } break;
        case 'tutorial': {
            tutorial(0);
        } break;
        case 'debug': {
            setStatus('debug');
            cube.init(['+.x', '+.y', '+.z', '-.x', '-.y', '-.z'].map(x => x as unknown as number));
        } break;
    }
}

// Инициализация
update_fontsize();
const hasVisited = getCookie('hasVisited');
if (hasVisited) {
    init('game');
} else {
    init('tutorial');
}
setCookie('hasVisited', 'true', 365);