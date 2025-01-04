interface Touch {
    start: {x: number | undefined, y: number | undefined};
    end: {x: number | undefined, y: number | undefined};
}

interface DOMElements {
    cube: HTMLElement;
    side: {[key: string]: HTMLElement};
    value: {[key: string]: HTMLElement};
    score: HTMLElement;
    max: HTMLCollectionOf<Element>;
}

interface InfoParams {
    top: string;
    header: string | number;
    text: string;
    color?: number[];
}

class Cube {
    private DOM: DOMElements;
    private axis: string[];
    public side: {[key: string]: number | string};
    private coords: string[];
    private score: number;
    private max_value: number;
    public end: boolean;

    constructor(element_id: string) {
        this.DOM = {
            cube: document.getElementById(element_id) as HTMLElement,
            side: {},
            value: {},
            score: document.getElementById('score') as HTMLElement,
            max: document.getElementsByClassName('max')
        };

        this.axis = ['x','y','z','-x','-y','-z'];
        this.side = {};
        this.coords = ['x','y','z'];
        this.score = 0;
        this.max_value = 0;
        this.end = false;

        this.init();
    }

    public init(sides?: number[]): void {
        this.coords = ['x','y','z'];
        this.score = 0;
        this.max_value = 0;
        this.end = false;

        this.DOM.cube.innerHTML = '<div id="side_-y" class="side"><span></span></div><div id="side_z" class="side front"><span></span></div><div id="side_x" class="side"><span></span></div><div id="side_y" class="side"><span></span></div><div id="side_-z" class="side"><span></span></div><div id="side_-x" class="side"><span></span></div>';
        this.DOM.cube.style.transform = new WebKitCSSMatrix().toString();
        this.DOM.score.innerHTML = this.score.toString();

        for (let i in this.axis) {
            this.DOM.side[this.axis[i]] = document.getElementById('side_'+this.axis[i]) as HTMLElement;
            this.DOM.value[this.axis[i]] = (document.getElementById('side_'+this.axis[i]) as HTMLElement).childNodes[0] as HTMLElement;
            this.side[this.axis[i]] = sides ? sides[parseInt(i)] : Math.round(Math.random()*2);
        }

        this.rotate3d(-1,-1,0,30); // initial rotation
        this.rotate_sides();
        this.fill(); // initial filling
    }

    private fill(): void {
        for (let i in this.axis) {
            const element = this.DOM.side[this.axis[i]];
            const value = this.side[this.axis[i]];
            element.childNodes[0].textContent = value.toString();
            const color = get_color(value);
            element.style.backgroundColor = `rgba(${color.join(',')},0.8)`;
        }
    }

    private animate_sides(_reseted: string, _increased: string): void {
        // deprecated
    }

    public make(direction: string, value?: number): void {
        const current_sides: {[key: string]: string} = {
            front: this.coords[2],
            down: this.coords[1],
            right: this.coords[0],
            back: '',
            up: '',
            left: ''
        };
        
        current_sides.back = (current_sides.front.length==1) ? '-'+current_sides.front : current_sides.front[1];
        current_sides.up = (current_sides.down.length==1) ? '-'+current_sides.down : current_sides.down[1];
        current_sides.left = (current_sides.right.length==1) ? '-'+current_sides.right : current_sides.right[1];
        
        const front_value = this.side[current_sides.front];
        const compare_value = this.side[current_sides[direction]];

        if (front_value != compare_value) {
            this.rotate(direction);
        } else {
            let max_value_changed = false;
            this.side[current_sides[direction]] = (this.side[current_sides[direction]] as number) + 1;
            
            if ((this.side[current_sides[direction]] as number) > this.max_value) {
                this.max_value = this.side[current_sides[direction]] as number;
                max_value_changed = true;

                for (let i = 0; i < this.DOM.max.length; i++) {
                    this.DOM.max[i].innerHTML = this.max_value.toString();
                }
            }

            this.score += this.side[current_sides[direction]] as number;
            this.side[current_sides.front] = value !== undefined ? value : this.get_new_value();

            this.animate_sides(current_sides.front, current_sides[direction]);
            this.fill();
            this.DOM.score.innerHTML = this.score.toString();

            if (this.check_fail()) {
                this.end = true;
            } else {
                this.end = false;
            }

            let info_show = false;
            const fail_text = `... and <b>${this.score}</b> points.<br/>but there are no other moves...<br/><br/><span class="touch">tap</span> or press <span class="key">space</span> to <b>restart</b><br/>See source on <a href="//github.com/titulus/cubegame">github</a>`;
            let header = this.max_value;
            let top = '';
            let text = '';
            let color: number[] | undefined = undefined;

            if (max_value_changed) {
                if (this.max_value == 5) {
                    top = 'CONGRATULATIONS!';
                    text = 'try to get 10 (;';
                    info_show = true;
                }
                if (this.max_value == 10) {
                    top = 'YOU <b>WON</b>!';
                    text = 'So... can you get 15?';
                    info_show = true;
                }
                if (this.max_value == 15) {
                    top = 'AMAZING!';
                    text = "I'll bet - you will do 20!";
                    info_show = true;
                }
                if (this.max_value >= 20) {
                    const tops = ['CONGRATULATIONS!','UNBELIEVABLE!','What a wonder!','Is that real?'];
                    top = tops[Math.floor(Math.random()*tops.length)];
                    text = 'Try to get '+(this.max_value+1);
                    info_show = true;
                }
            }

            if (this.end) {
                text = fail_text;
                top = (top=='') ? 'So sorry ):' : top;
                color = [0,0,0];
                info_show = true;
            } else {
                text += '<br/><span class="touch">tap</span> or press <span class="key">space</span> to <b>continue</b><br/>See source on <a href="//github.com/titulus/cubegame">github</a>';
            }

            if (info_show) {
                toggle_info({top, header, text, color: color || get_color(header)});
                status = 'infobox';
            }
        }

        const prev_front = document.getElementsByClassName('front')[0];
        prev_front.className = 'side';
        this.DOM.side[this.coords[2]].className = 'side front';
    }

    private get_new_value(): number {
        const values = unique([
            this.side['x'],
            this.side['-x'],
            this.side['y'],
            this.side['-y'],
            this.side['-z']
        ].map(v => v as number)).sort();

        if (values[0] != 0) values.unshift(values[0]-1);
        let rand = 0;
        if (values.length == 2) {
            rand = Math.round(Math.random());
        } else if (values.length > 2) {
            rand = Math.round(Math.random()*9);
            rand = (rand < 3) ? 0 : (rand < 9) ? 1 : 2;
        }

        return values[rand];
    }

    private check_fail(): boolean {
        return (
            this.side['z'] != this.side['-y'] &&
            this.side['z'] != this.side['-x'] &&
            this.side['z'] != this.side['x'] &&
            this.side['z'] != this.side['y'] &&
            this.side['-z'] != this.side['-y'] &&
            this.side['-z'] != this.side['-x'] &&
            this.side['-z'] != this.side['x'] &&
            this.side['-z'] != this.side['y'] &&
            this.side['-y'] != this.side['-x'] &&
            this.side['-y'] != this.side['x'] &&
            this.side['y'] != this.side['-x'] &&
            this.side['y'] != this.side['x']
        );
    }

    public rotate(direction: string): void {
        let t_angles: number[] = [0,0,0];
        switch (direction) {
            case "up": {
                t_angles = this.convert_angles(1,0);
            }; break;
            case "down": {
                t_angles = this.convert_angles(-1,0);
            }; break;
            case "left": {
                t_angles = this.convert_angles(0,-1);
            }; break;
            case "right": {
                t_angles = this.convert_angles(0,1);
            }; break;
            default: throw new TypeError('direction must be "up", "down", "left" or "right", but not: "'+direction+'"');
        }
        this.update_coords(direction);
        this.rotate3d(t_angles[0],t_angles[1],t_angles[2],90);
        this.rotate_sides(direction);
    }

    private rotate_sides(_direction?: string): void {
        const rotate_side = (side: string, angles: number[]): void => {
            this.DOM.value[side].style.transform = `rotateX(${angles[0]}deg) rotateY(${angles[1]}deg) rotateZ(${angles[2]}deg)`;
        };

        const rotate_both_sides = (side: string, angles: number[]): void => {
            rotate_side(side, angles);
            rotate_side('-'+side, angles);
        };

        switch(this.coords.join(',')) {
            case 'x,y,z': { //default
                rotate_both_sides('x',[0,0,0]);
                rotate_both_sides('y',[0,0,0]);
                rotate_both_sides('z',[0,0,0]);
            };break;
            case 'z,x,y': {
                rotate_both_sides('x',[0,180,0]);
                rotate_both_sides('y',[0,180,90]);
                rotate_both_sides('z',[0,0,-90]);
            };break;
            case 'y,z,x': {
                rotate_both_sides('x',[0,0,90]);
                rotate_both_sides('y',[0,180,0]);
                rotate_both_sides('z',[0,180,90]);
            };break;
            case 'x,-z,y': {
                rotate_both_sides('x',[0,0,-90]);
                rotate_both_sides('y',[180,0,0]);
                rotate_both_sides('z',[0,0,0]);
            };break;
            case 'z,-y,x': {
                rotate_both_sides('x',[180,180,0]);
                rotate_both_sides('y',[0,180,90]);
                rotate_both_sides('z',[180,180,0]);
            };break;
            case 'y,-x,z': {
                rotate_both_sides('x',[0,0,90]);
                rotate_both_sides('y',[180,0,90]);
                rotate_both_sides('z',[0,0,90]);
            };break;
            case '-z,y,x': {
                rotate_both_sides('x',[0,0,0]);
                rotate_both_sides('y',[0,0,-90]);
                rotate_both_sides('z',[0,180,0]);
            };break;
            case '-x,z,y': {
                rotate_both_sides('x',[180,0,90]);
                rotate_both_sides('y',[0,180,0]);
                rotate_both_sides('z',[0,180,0]);
            };break;
            case '-y,x,z': {
                rotate_both_sides('x',[180,0,90]);
                rotate_both_sides('y',[0,0,-90]);
                rotate_both_sides('z',[0,0,-90]);
            };break;
            case '-x,-y,z': {
                rotate_both_sides('x',[180,0,0]);
                rotate_both_sides('y',[0,180,0]);
                rotate_both_sides('z',[0,0,180]);
            };break;
            case '-z,-x,y': {
                rotate_both_sides('x',[0,0,0]);
                rotate_both_sides('y',[180,0,90]);
                rotate_both_sides('z',[180,0,90]);
            };break;
            case '-y,-z,x': {
                rotate_both_sides('x',[0,0,-90]);
                rotate_both_sides('y',[0,0,180]);
                rotate_both_sides('z',[0,0,-90]);
            };break;
            case 'x,z,-y': {
                rotate_both_sides('x',[0,0,90]);
                rotate_both_sides('y',[0,0,0]);
                rotate_both_sides('z',[180,0,0]);
            };break;
            case 'z,y,-x': {
                rotate_both_sides('x',[0,180,0]);
                rotate_both_sides('y',[0,0,90]);
                rotate_both_sides('z',[0,0,0]);
            };break;
            case 'y,x,-z': {
                rotate_both_sides('x',[0,180,90]);
                rotate_both_sides('y',[0,180,90]);
                rotate_both_sides('z',[0,180,90]);
            };break;
            case 'x,-y,-z': {
                rotate_both_sides('x',[0,0,180]);
                rotate_both_sides('y',[180,0,0]);
                rotate_both_sides('z',[180,0,0]);
            };break;
            case 'z,-x,-y': {
                rotate_both_sides('x',[180,0,0]);
                rotate_both_sides('y',[0,0,90]);
                rotate_both_sides('z',[0,0,90]);
            };break;
            case 'y,-z,-x': {
                rotate_both_sides('x',[0,180,90]);
                rotate_both_sides('y',[180,0,0]);
                rotate_both_sides('z',[0,0,90]);
            };break;
            case '-y,-x,-z': {
                rotate_both_sides('x',[0,0,-90]);
                rotate_both_sides('y',[0,0,90]);
                rotate_both_sides('z',[180,0,90]);
            };break;
            case '-x,-z,-y': {
                rotate_both_sides('x',[0,180,90]);
                rotate_both_sides('y',[180,180,0]);
                rotate_both_sides('z',[0,0,180]);
            };break;
            case '-z,-y,-x': {
                rotate_both_sides('x',[180,0,0]);
                rotate_both_sides('y',[180,0,90]);
                rotate_both_sides('z',[180,0,0]);
            };break;
            case '-x,y,-z': {
                rotate_both_sides('x',[0,180,0]);
                rotate_both_sides('y',[0,0,180]);
                rotate_both_sides('z',[0,180,0]);
            };break;
            case '-z,x,-y': {
                rotate_both_sides('x',[180,0,0]);
                rotate_both_sides('y',[0,0,-90]);
                rotate_both_sides('z',[0,180,90]);
            };break;
            case '-y,z,-x': {
                rotate_both_sides('x',[180,0,90]);
                rotate_both_sides('y',[0,0,0]);
                rotate_both_sides('z',[180,0,90]);
            };break;
        }
    }

    private update_coords(direction: string): void {
        switch (direction) {
            case "up": {
                const temp = this.coords[2];
                this.coords[2] = this.coords[1];
                this.coords[1] = (temp.length==1) ? '-'+temp : temp[1];
            }; break;
            case "down": {
                const temp = this.coords[1];
                this.coords[1] = this.coords[2];
                this.coords[2] = (temp.length==1) ? '-'+temp : temp[1];
            }; break;
            case "right": {
                const temp = this.coords[0];
                this.coords[0] = this.coords[2];
                this.coords[2] = (temp.length==1) ? '-'+temp : temp[1];
            }; break;
            case "left": {
                const temp = this.coords[2];
                this.coords[2] = this.coords[0];
                this.coords[0] = (temp.length==1) ? '-'+temp : temp[1];
            }; break;
        }
    }

    private convert_angles(x: number, y: number): number[] {
        const new_angles: number[] = [0,0,0];
        switch (this.coords[0]) {
            case "x": new_angles[0]=x;break;
            case "-x": new_angles[0]=-x;break;
            case "y": new_angles[1]=x;break;
            case "-y": new_angles[1]=-x;break;
            case "z": new_angles[2]=x;break;
            case "-z": new_angles[2]=-x;break;
        }
        switch (this.coords[1]) {
            case "x": new_angles[0]=y;break;
            case "-x": new_angles[0]=-y;break;
            case "y": new_angles[1]=y;break;
            case "-y": new_angles[1]=-y;break;
            case "z": new_angles[2]=y;break;
            case "-z": new_angles[2]=-y;break;
        }
        return new_angles;
    }

    private rotate3d(x: number, y: number, z: number, degree: number): void {
        const matrix = new WebKitCSSMatrix(this.DOM.cube.style.transform);
        const newMatrix = matrix.rotateAxisAngle(x, y, z, degree);
        this.DOM.cube.style.transform = newMatrix.toString();
    }
}

// Добавляем интерфейс для WebKitCSSMatrix, так как TypeScript его не знает
declare class WebKitCSSMatrix {
    constructor(matrix?: string);
    rotateAxisAngle(x: number, y: number, z: number, angle: number): WebKitCSSMatrix;
    toString(): string;
}

function unique(arr: (number | string)[]): number[] {
    const result: number[] = [];
    
    nextInput:
    for(let i = 0; i < arr.length; i++) {
        const str = arr[i];
        for(let j = 0; j < result.length; j++) {
            if (result[j] == str) continue nextInput;
        }
        result.push(Number(str));
    }
    
    return result;
}

function toggle_info(params?: InfoParams): void {
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

// Продолжить с остальными функциями?

let status: string = '';
const touch: Touch = {
    start: {x: undefined, y: undefined},
    end: {x: undefined, y: undefined}
};
const cube = new Cube('cube3d');

function get_color(value: number | string): number[] {
    switch (value) {
        case 'hello': return [50,21,82];
        case 0: return [75,0,125];
        default: {
            Math.seedrandom(value.toString());
            const color = [
                (Math.round(Math.random()*250)+5),
                (Math.round(Math.random()*250)+5),
                (Math.round(Math.random()*250)+5)
            ];
            Math.seedrandom();
            return color;
        }
    }
}

// ... остальные функции также переписываем с добавлением типов

export function initEventHandlers(): void {
    document.body.addEventListener('touchstart', touchStart);
    document.body.addEventListener('touchmove', touchMove);
    document.body.addEventListener('touchend', touchEnd);
    document.body.addEventListener('touchcancel', touchCancel);
    document.body.addEventListener('keyup', keyup);
    window.addEventListener('resize', update_fontsize);
}

// Инициализация
init('tutorial'); 

function touchStart(e: TouchEvent): void {
    e.preventDefault();
    touch.start.x = e.changedTouches[0].clientX;
    touch.start.y = e.changedTouches[0].clientY;
}

function touchMove(_e: TouchEvent): void {}

function touchCancel(_e: TouchEvent): void {}

function touchEnd(e: TouchEvent): void {
    if ((e.target as HTMLElement).nodeName != 'A') {
        e.preventDefault();
        touch.end.x = e.changedTouches[0].clientX;
        touch.end.y = e.changedTouches[0].clientY;
        touch_handler();
    } else {
        console.log(e);
        (e.target as HTMLAnchorElement).click();
    }
}

function touch_handler(): void {
    let evnt = '';
    const dX = touch.end.x! - touch.start.x!;
    const dY = touch.end.y! - touch.start.y!;
    
    if (Math.abs(dX) == Math.abs(dY)) {
        evnt = 'tap';
    } else {
        let d = 0;
        if (Math.abs(dX) > Math.abs(dY)) {
            d = Math.abs(dX);
            evnt = (dX > 0) ? 'right' : 'left';
        } else {
            d = Math.abs(dY);
            evnt = (dY > 0) ? 'down' : 'up';
        }
        if (d < 20) evnt = 'tap';
    }
    event_handler(evnt);
}

function keyup(ev: KeyboardEvent): void {
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

function event_handler(ev: string): void {
    switch(status) {
        case 'infobox': {
            if (ev == 'tap' || ev == 'space') {
                toggle_info();
                status = 'game';
            }
        }; break;
        case 'game': {
            if (ev == 'up' || ev == 'down' || ev == 'left' || ev == 'right') cube.make(ev);
        }; break;
        case 'hello': {
            if (ev == 'esc' || ev == 'tap' || ev == 'space') {
                toggle_info();
                status = 'game';
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
                status = 'game';
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

function update_fontsize(): void {
    const W = window.innerWidth;
    const H = window.innerHeight;
    document.body.style.fontSize = ((W > H) ? H * 0.04 : W * 0.04) + 'px';
}

function tutorial(state: number): void {
    switch (state) {
        case 0: {
            toggle_info({
                top: '',
                header: 'helloX',
                text: 'Use arrowkeys <span class="key">&larr;</span>,<span class="key">&uarr;</span>,<span class="key">&rarr;</span>,<span class="key">&darr;</span><br/>'
                    + 'or swipes <span class="touch">&larr;</span>,<span class="touch">&uarr;</span>,<span class="touch">&rarr;</span>,<span class="touch">&darr;</span> '
                    + 'to increase chosen side, if it equal to front, or rotate cube otherwise.<br/>'
                    + '<b>Goal:</b> get <span class="sside" style="background-color: rgba(247, 72, 54, 0.8); padding:0;">10</span> on one side.<br/>'
                    + 'Press <span class="key">space</span> or <span class="touch">tap</span> to see <b>tutorial</b>.<br/>'
                    + 'Press <span class="key">esc</span> or swipe <span class="touch">&uarr;</span> to skip it',
                color: [125,125,255]
            });
            status = 'tutorial-0';
        }; break;
        case 1: {
            cube.init([1,0,1,2,1,0]);
            toggle_info();
            const tutorial1 = document.getElementById('tutorial-1') as HTMLElement;
            tutorial1.style.display = 'block';
            setTimeout(() => {
                tutorial1.style.opacity = '1';
            }, 0);
            status = 'tutorial-1';
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

            status = 'tutorial-2';
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

            status = 'tutorial-3';
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
                    status = 'infobox';
                }, 500);
            }, 500);
            status = 'tutorial-4';
        }; break;
    }
}

function init(state: string): void {
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
                color: [125,125,255]
            });
            status = 'infobox';
        }; break;
        case 'tutorial': {
            tutorial(0);
        }; break;
        case 'debug': {
            status = 'debug';
            cube.init(['+.x','+.y','+.z','-.x','-.y','-.z'].map(x => x as unknown as number));
        }; break;
    }
}

update_fontsize();
init('tutorial'); 