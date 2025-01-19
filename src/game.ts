import { Cube } from './classes/Cube';
import { tutorial } from './tutorial';
import { update_fontsize, toggle_info } from './utils/ui';
import { setStatus, getStatus } from './store';
import { getCookie, setCookie } from './utils/cookies';
import { setLanguage, t, getLanguage } from './i18n';

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
                showLangSwitch: true,
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
const langSwitchButton = document.getElementById('lang-switch') as HTMLButtonElement;
let currentLang = getLanguage() || 'en';
langSwitchButton.textContent = currentLang;

function switchLanguage() {
    const newLang = currentLang === 'en' ? 'ru' : 'en';
    setLanguage(newLang);
    langSwitchButton.textContent = newLang;
    setCookie('lang', newLang, 365);
    currentLang = newLang;
    const status = getStatus();
    switch (status) {
        case 'infobox':
            init('game');
            break;
        case 'tutorial-0':
            tutorial(0);
            break;
    }
}

langSwitchButton.addEventListener('click', () => {
    switchLanguage();
});

setCookie('hasVisited', 'true', 365);
