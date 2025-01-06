import { DOMElements } from '../types/interfaces';
import { get_color } from '../utils/colors';
import { unique } from '../utils/helpers';
import { toggle_info } from '../utils/ui';
import { setStatus } from '../store';

declare class WebKitCSSMatrix {
    constructor(matrix?: string);
    rotateAxisAngle(x: number, y: number, z: number, angle: number): WebKitCSSMatrix;
    toString(): string;
}

export class Cube {
    private DOM: DOMElements;
    private axis: string[];
    public side: {[key: string]: number | string};
    private coords: string[];
    private score: number;
    private max_value: number;
    public end: boolean;
    private rotateSound: HTMLAudioElement;
    private winSound: HTMLAudioElement;
    private failSound: HTMLAudioElement;
    private increaseSound: HTMLAudioElement;
    private remainingIncrements: number;

    constructor(element_id: string) {
        this.DOM = {
            cube: document.getElementById(element_id) as HTMLElement,
            side: {},
            value: {},
            score: document.getElementById('score') as HTMLElement,
            max: document.getElementsByClassName('max'),
            increment: document.getElementById('increment-counter') as HTMLElement
        };

        this.axis = ['x','y','z','-x','-y','-z'];
        this.side = {};
        this.coords = ['x','y','z'];
        this.score = 0;
        this.max_value = 0;
        this.remainingIncrements = 1;
        this.end = false;
        this.rotateSound = new Audio('sounds/rotate.mp3');
        this.winSound = new Audio('sounds/win.mp3');
        this.failSound = new Audio('sounds/fail.mp3');
        this.increaseSound = new Audio('sounds/increase.mp3');

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
        this.DOM.increment.innerHTML = `x${this.remainingIncrements}`;

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
            this.playSound('increase');

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
                    text = 'You\'ve got +1<br/>You\'ll get it each time you increase the max value<br/>Try to get 10 (;';
                    info_show = true;
                    this.playSound('win');
                }
                if (this.max_value == 10) {
                    top = 'YOU <b>WON</b>!';
                    text = 'So... can you get 15?';
                    info_show = true;
                    this.playSound('win');
                }
                if (this.max_value == 15) {
                    top = 'AMAZING!';
                    text = "I'll bet - you will do 20!";
                    info_show = true;
                    this.playSound('win');
                }
                if (this.max_value >= 20) {
                    const tops = ['CONGRATULATIONS!','UNBELIEVABLE!','What a wonder!','Is that real?'];
                    top = tops[Math.floor(Math.random()*tops.length)];
                    text = 'Try to get '+(this.max_value+1);
                    info_show = true;
                    this.playSound('win');
                }
                if (this.max_value >= 5) {
                    this.remainingIncrements++;
                    this.DOM.increment.innerHTML = `x${this.remainingIncrements}`;
                    // Reset visual state if it was disabled
                    if (this.remainingIncrements > 0) {
                        this.DOM.increment.style.opacity = '1';
                        this.DOM.increment.style.cursor = 'pointer';
                    }
                }
            }

            if (this.end) {
                text = fail_text;
                top = (top=='') ? 'So sorry ):' : top;
                color = [0,0,0];
                info_show = true;
                this.playSound('fail');
            } else {
                text += '<br/><span class="touch">tap</span> or press <span class="key">space</span> to <b>continue</b><br/>See source on <a href="//github.com/titulus/cubegame">github</a>';
            }

            if (info_show) {
                toggle_info({top, header, text, color: color || get_color(header)});
                setStatus('infobox');
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
        return false; // temporary. IDK if fail is needed at all
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
        this.playSound('rotate');
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

    private playSound(type: string = 'rotate'): void {
        if (type === 'rotate') {
            this.rotateSound.play();
        } else if (type === 'win') {
            this.winSound.play();
        } else if (type === 'fail') {
            this.failSound.play();
        } else if (type === 'increase') {
            this.increaseSound.play();
        }
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

    public incrementFrontValue(): void {
        if (this.remainingIncrements <= 0) return;
    
        this.remainingIncrements--;
        this.DOM.increment.innerHTML = `x${this.remainingIncrements}`;
        
        if (this.remainingIncrements === 0) {
            this.DOM.increment.style.opacity = '0.5';
            this.DOM.increment.style.cursor = 'not-allowed';
        }
        
        const frontSide = this.coords[2];
        this.side[frontSide] = (this.side[frontSide] as number) + 1;
        this.fill();
        this.playSound('increase');
        
        this.score += 1;
        this.DOM.score.innerHTML = this.score.toString();
        
        if ((this.side[frontSide] as number) > this.max_value) {
            this.max_value = this.side[frontSide] as number;
            for (let i = 0; i < this.DOM.max.length; i++) {
                this.DOM.max[i].innerHTML = this.max_value.toString();
            }
        }
    }    
}
