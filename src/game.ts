import { Cube } from './classes/Cube';
import { tutorial } from './tutorial';
import { update_fontsize, toggle_info } from './utils/ui';
import { setStatus } from './store';
import { getCookie, setCookie } from './utils/cookies';

import { t } from './i18n';
export const cube = new Cube('cube3d');


export function init(state: string): void {
    switch (state) {
        case 'game': {
            cube.init();
            toggle_info({
                top: '',
                header: t('game.welcome.header'),
                text: t('game.welcome.text'),
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
