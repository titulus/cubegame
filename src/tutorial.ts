import { cube } from './game';
import { toggle_info } from './utils/ui';
import { t } from './i18n';
import { setStatus } from './store';
import { Analytics } from './utils/analytics';


export function tutorial(state: number): void {
    const tutorial1 = document.getElementById('tutorial-1') as HTMLElement;
    const tutorial2 = document.getElementById('tutorial-2') as HTMLElement;
    const tutorial3 = document.getElementById('tutorial-3') as HTMLElement;
    const tutorial4 = document.getElementById('tutorial-4') as HTMLElement;
    if (tutorial1) tutorial1.innerHTML = t('tutorial.step1');
    if (tutorial2) tutorial2.innerHTML = t('tutorial.step2');
    if (tutorial3) tutorial3.innerHTML = t('tutorial.step3');
    if (tutorial4) tutorial4.innerHTML = t('tutorial.step4');

    switch (state) {
        case 0: {
            Analytics.tutorialStart();
            Analytics.tutorialStep(0, 'welcome_screen');
            toggle_info({
                top: '',
                header: t('tutorial.welcome.header'),
                text: t('tutorial.welcome.text'),
                color: [125,125,255]
            });
            setStatus('tutorial-0');
        }; break;
        case 1: {
            Analytics.tutorialStep(1, 'combine_same_numbers');
            cube.init([1,0,0,0,0,0]);
            toggle_info();
            tutorial1.style.display = 'block';
            setTimeout(() => {
                tutorial1.style.opacity = '1';
            }, 0);
            setStatus('tutorial-1');
        }; break;
        case 2: {
            Analytics.tutorialStep(2, 'first_combination');
            cube.make('up', 0);
            tutorial1.style.opacity = '0';
            
            setTimeout(() => {
                tutorial1.style.display = 'none';
                tutorial2.style.display = 'block';
                setTimeout(() => {
                    tutorial2.style.opacity = '1';
                }, 100);
            }, 500);

            setStatus('tutorial-2');
        }; break;
        case 3: {
            Analytics.tutorialStep(3, 'rotation_explained');
            cube.make('right', 0);
            tutorial2.style.opacity = '0';
            setTimeout(() => {
                tutorial2.style.display = 'none';
                tutorial3.style.display = 'block';
                 setTimeout(() => {
                    tutorial3.style.opacity = '1';
                }, 100);
                const increment = document.getElementById('increment-btn-tutorial') as HTMLElement;
                const incrementClickHandler = () => {
                    console.log('click');
                    increment.removeEventListener('click', incrementClickHandler);
                    tutorial(4);
                };
                increment.addEventListener('click', incrementClickHandler, { once: true });
                increment.addEventListener('touchstart', incrementClickHandler, { once: true });
            }, 500);
            setStatus('tutorial-3');
        }; break;
        case 4: {
            Analytics.tutorialStep(4, 'increment_explained');
            cube.incrementFrontValue();
            tutorial3.style.opacity = '0';
            
            setTimeout(() => {
                tutorial3.style.display = 'none';
                tutorial4.style.display = 'block';
                setTimeout(() => {
                    tutorial4.style.opacity = '1';
                }, 100);
            }, 500);

            setStatus('tutorial-4');
        }; break;
        case 5: {
            Analytics.tutorialStep(5, 'scoring_explained');
            Analytics.tutorialComplete();
            cube.make('up');
            tutorial4.style.opacity = '0';
            setTimeout(() => {
                tutorial4.style.display = 'none';
                setTimeout(() => {
                    toggle_info({
                        top: t('tutorial.complete.top'),
                        header: t('tutorial.complete.header'),
                        text: t('tutorial.complete.text'),
                        color: [194,158,250]
                    });
                    setStatus('infobox');
                }, 500);
            }, 500);
            setStatus('tutorial-5');
        }; break;
    }
}
