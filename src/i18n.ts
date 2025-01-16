interface Translations {
    en: {
        game: {
            welcome: {
                header: string;
                text: string;
            };
        };
        tutorial: {
            welcome: {
                header: string;
                text: string;
            };
            step1: string;
            step2: string;
            step3: string;
            step4: string;
            complete: {
                top: string;
                header: string;
                text: string;
            };
        };
        cube: {
            fail: {
                tops: string[];
                text1: (params: { score: number }) => string;
                text2: (params: { rank: number, total_games: number }) => string;
                text3: (params: { medal: string, index: number, username: string, score: number, max_value: number, total_games: number }) => string;
                text4: string;
            };
            win: {
                tops: string[];
                text1: string;
                text2: string;
            };
        };
        sides: string;
        increment: (params: { remainingIncrements: number }) => string;
    };
    // Allow for potential future language additions
    [key: string]: any;
}

const translations: Translations = {
    en: {
        game: {
            welcome: {
                header: 'hello',
                text: 'press <span class="key">&larr;</span>,<span class="key">&uarr;</span>,<span class="key">&rarr;</span>,<span class="key">&darr;</span><br/>'
                    + 'or<br/>swipe <span class="touch">&larr;</span>,<span class="touch">&uarr;</span>,<span class="touch">&rarr;</span>,<span class="touch">&darr;</span>.<br/>'
                    + 'Chosen side will increased, if it equal to front, cube will rotate otherwise.<br/>'
                    + 'Press <span class="key">space</span> or <span class="touch">tap</span> to close info'
            }
        },
        tutorial: {
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
            }
        },
        cube: {
            fail: {
                tops: ['At least you tried!','Not bad! But you can do better!', 'You\'re almost there!', 'You can do better!', 'Try harder!'],
                text1: (params: { score: number }) => `... and <b>${params.score}</b> points.<br/>but there are no other moves...`,
                text2: (params: { rank: number, total_games: number }) => `<br/>Your score is <b>${params.rank}</b> out of <b>${params.total_games}</b> games.<br/>`,
                text3: (params: { medal: string, index: number, username: string, score: number, max_value: number, total_games: number }) => `<br/>${params.medal} ${params.index + 1}. ${params.username}: <b>${params.score}</b> 🎲 ${params.max_value} (${params.total_games} games)`,
                text4: `<br/><br/><span class="touch">tap</span> or press <span class="key">space</span> to <b>restart</b><br/>See source on <a href="//github.com/titulus/cubegame">github</a>`
            },
            win: {
                tops: ['CONGRATULATIONS!','UNBELIEVABLE!','What a wonder!','Is that real?'],
                text1: `You've got +1<br/>You'll get it each time you increase the max value.`,
                text2: `<br/><br/><span class="touch">tap</span> or press <span class="key">space</span> to <b>continue</b>`
            }
        },
        sides: '<div id="side_-y" class="side"><span></span></div><div id="side_z" class="side front"><span></span></div><div id="side_x" class="side"><span></span></div><div id="side_y" class="side"><span></span></div><div id="side_-z" class="side"><span></span></div><div id="side_-x" class="side"><span></span></div>',
        increment: (params: { remainingIncrements: number }) => `x${params.remainingIncrements}`,
    }
};

// Global language configuration
let currentLanguage: keyof Translations = 'en';

// Function to set the global language
export function setLanguage(lang: keyof Translations) {
    currentLanguage = lang;
}

// Function to get the current global language
export function getLanguage(): keyof Translations {
    return currentLanguage;
}

export function t(key: string, params: any = {}): string {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    for (const k of keys) {
        if (value && typeof value === 'object' && value.hasOwnProperty(k)) {
            value = value[k];
        } else {
            return key;
        }
    }
    if (typeof value === 'function') {
        return value(params);
    }
    return value;
}
