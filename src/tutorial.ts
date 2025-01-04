import { cube } from './game';
import { toggle_info } from './utils/ui';
import { setStatus } from './store';

export function tutorial(state: number): void {
    switch (state) {
        case 0: {
            toggle_info({
                top: '',
                header: 'hello',
                text: 'Use arrowkeys <span class="key">&larr;</span>,<span class="key">&uarr;</span>,<span class="key">&rarr;</span>,<span class="key">&darr;</span><br/>'
                    + 'or swipes <span class="touch">&larr;</span>,<span class="touch">&uarr;</span>,<span class="touch">&rarr;</span>,<span class="touch">&darr;</span> '
                    + 'to increase chosen side, if it equal to front, or rotate cube otherwise.<br/>'
                    + '<b>Goal:</b> get <span class="sside" style="background-color: rgba(247, 72, 54, 0.8); padding:0;">10</span> on one side.<br/>'
                    + 'Press <span class="key">space</span> or <span class="touch">tap</span> to see <b>tutorial</b>.<br/>'
                    + 'Press <span class="key">esc</span> or swipe <span class="touch">&uarr;</span> to skip it',
                color: [125,125,255]
            });
            setStatus('tutorial-0');
        }; break;
        case 1: {
            cube.init([1,0,1,2,1,0]);
            toggle_info();
            const tutorial1 = document.getElementById('tutorial-1') as HTMLElement;
            tutorial1.style.display = 'block';
            setTimeout(() => {
                tutorial1.style.opacity = '1';
            }, 0);
            setStatus('tutorial-1');
        }; break;
        case 2: {
            cube.make('up', 0);
            const tutorial1 = document.getElementById('tutorial-1') as HTMLElement;
            const tutorial2 = document.getElementById('tutorial-2') as HTMLElement;
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
            cube.make('right');
            const tutorial2 = document.getElementById('tutorial-2') as HTMLElement;
            const tutorial3 = document.getElementById('tutorial-3') as HTMLElement;
            tutorial2.style.opacity = '0';
            
            setTimeout(() => {
                tutorial2.style.display = 'none';
                tutorial3.style.display = 'block';
                setTimeout(() => {
                    tutorial3.style.opacity = '1';
                }, 100);
            }, 500);

            setStatus('tutorial-3');
        }; break;
        case 4: {
            const tutorial3 = document.getElementById('tutorial-3') as HTMLElement;
            const score = document.getElementById('score') as HTMLElement;
            tutorial3.style.opacity = '0';
            score.style.backgroundColor = 'rgba(255, 255, 125, 0.5)';
            score.style.boxShadow = '0 0 0.5em rgb(255, 255, 125)';
            score.style.color = 'rgb(255, 255, 125)';
            
            setTimeout(() => {
                tutorial3.style.display = 'none';
                cube.make('up');
                setTimeout(() => {
                    score.style.backgroundColor = '';
                    score.style.boxShadow = '';
                    score.style.color = 'white';
                    toggle_info({
                        top: 'cool! you got',
                        header: '3',
                        text: 'Now, try to get <span class="sside" style="background-color: rgba(229, 25, 244, 0.8);">5</span> somewhere<br/><br/>'
                            + '<span class="touch">tap</span> or press <span class="key">space</span> to <b>continue</b>.<br/>',
                        color: [194,158,250]
                    });
                    setStatus('infobox');
                }, 500);
            }, 500);
            setStatus('tutorial-4');
        }; break;
    }
} 