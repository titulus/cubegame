import { cube } from './game';
import { toggle_info } from './utils/ui';
import { setStatus } from './store';
import { Analytics } from './utils/analytics';

const TUTORIAL_TEXT = {
    welcome: {
        header: 'hello',
        text: `Use arrowkeys <span class="key">←</span>,<span class="key">↑</span>,<span class="key">→</span>,<span class="key">↓</span><br/>
            or swipes <span class="touch">←</span>,<span class="touch">↑</span>,<span class="touch">→</span>,<span class="touch">↓</span>
            to increase chosen side, if it equal to front, or rotate cube otherwise.<br/>
            <b>Goal:</b> get <span class="sside" style="background-color: rgba(247, 72, 54, 0.8); padding:0;">10</span> on one side.<br/>
            Press <span class="key">space</span> or <span class="touch">tap</span> to see <b>tutorial</b>.<br/>
            Press <span class="key">esc</span> or swipe <span class="touch">↑</span> to skip it`
    },
    step1: `<img src="/img/arrow_u.gif" class="helper">
            <div class="content">
                <b>front</b> <span class="sside" style="background-color: rgba(75, 0, 125, 0.8);">0</span> = <b>top</b> <span class="sside" style="background-color: rgba(75, 0, 125, 0.8);">0</span><br/>
                do <span class="key">↑</span> or <span class="touch">↑</span> to combine them.<br/>
                <b>top</b> will increase <span class="sside" style="background-color: rgba(75, 0, 125, 0.8);">0</span> → <span class="sside" style="background-color: rgba(49, 59, 136, 0.8);">1</span><br/>
                and <b>front</b> will get random <span class="sside" style="background-color: rgba(75, 0, 125, 0.8);">0</span> → <span class="sside" style="background-color: rgba(255, 75, 75, 0.8);">?</span>
            </div>`,
    step2: `<img src="/img/arrow_r.gif" class="helper">
            <div class="content">
                <b>front</b> <span class="sside" style="background-color: rgba(75, 0, 125, 0.8);">0</span> ≠ <b>right</b> <span class="sside" style="background-color: rgba(49, 59, 136, 0.8);">1</span><br/>
                do <span class="key">→</span> or <span class="touch">→</span> to rotate cube.<br/>
                They <b>will not</b> change, but cube will rotate
            </div>`,
    step3: `<div class="content">
                Now you can use <span style="display: inline-block; background-color: rgba(255, 255, 125, 0.5); box-shadow: 0 0 0.5em rgb(255, 255, 125); color: rgb(0,0,0); padding: 0 0.2em; border-radius: 0.2em;">+1</span> button to increase<br/>
                <b>front</b> side value:
                <span class="sside" style="background-color: rgba(75, 0, 125, 0.8);">0</span> → <span class="sside" style="background-color: rgba(49, 59, 136, 0.8);">1</span><br/>
Tap it!
            </div>
            <img src="/img/arrow_down.gif" class="helper">
            <div id="increment-btn-tutorial" style="position: absolute; bottom: .3em; right: .3em; font-weight: 700; font-size: 400%; color: white; text-shadow: 0 0 .3em #014; cursor: pointer; transition: all .1s linear; padding: 0 0.3em; border-radius: 0.2em; background: rgba(0,10,40,0.1);">+1</div>`,
    step4: `<img src="/img/arrow_u.gif" class="helper">
            <div class="content">
                Once you combine sides, you get <b>points</b><br/>
                as much as you get on increased side<br/>
                top <span class="sside" style="background-color: rgba(49, 59, 136, 0.8);">1</span> will become <span class="sside" style="background-color: rgba(105, 31, 31, 0.8);">2</span> and your score will increase value<span class="sside" style="background-color: rgba(255, 252, 100, 0.8);">2</span> → <span class="sside" style="background-color: rgba(255, 252, 100, 0.8);">4</span>
            </div>`,
    complete: {
        top: 'cool! you got',
        header: '2',
        text: `Now, try to get <span class="sside" style="background-color: rgba(229, 25, 244, 0.8);">5</span> somewhere<br/><br/>
            <span class="touch">tap</span> or press <span class="key">space</span> to <b>continue</b>.<br/>`
    }};

export function tutorial(state: number): void {
    const tutorial1 = document.getElementById('tutorial-1') as HTMLElement;
    const tutorial2 = document.getElementById('tutorial-2') as HTMLElement;
    const tutorial3 = document.getElementById('tutorial-3') as HTMLElement;
    const tutorial4 = document.getElementById('tutorial-4') as HTMLElement;
    if (tutorial1) tutorial1.innerHTML = TUTORIAL_TEXT.step1;
    if (tutorial2) tutorial2.innerHTML = TUTORIAL_TEXT.step2;
    if (tutorial3) tutorial3.innerHTML = TUTORIAL_TEXT.step3;
    if (tutorial4) tutorial4.innerHTML = TUTORIAL_TEXT.step4;

    switch (state) {
        case 0: {
            Analytics.tutorialStart();
            Analytics.tutorialStep(0, 'welcome_screen');
            toggle_info({
                top: '',
                header: TUTORIAL_TEXT.welcome.header,
                text: TUTORIAL_TEXT.welcome.text,
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
                        top: TUTORIAL_TEXT.complete.top,
                        header: TUTORIAL_TEXT.complete.header,
                        text: TUTORIAL_TEXT.complete.text,
                        color: [194,158,250]
                    });
                    setStatus('infobox');
                }, 500);
            }, 500);
            setStatus('tutorial-5');
        }; break;
    }
}