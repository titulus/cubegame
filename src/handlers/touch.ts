import { Touch } from '../types/interfaces';
import { event_handler } from './events';

export const touch: Touch = {
    start: {x: undefined, y: undefined},
    end: {x: undefined, y: undefined}
};

export function touchStart(e: TouchEvent): void {
    e.preventDefault();
    touch.start.x = e.changedTouches[0].clientX;
    touch.start.y = e.changedTouches[0].clientY;
}

export function touchMove(_e: TouchEvent): void {}

export function touchCancel(_e: TouchEvent): void {}

export function touchEnd(e: TouchEvent): void {
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

export function touch_handler(): void {
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