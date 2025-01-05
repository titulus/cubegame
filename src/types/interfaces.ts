export interface Touch {
    start: {x: number | undefined, y: number | undefined};
    end: {x: number | undefined, y: number | undefined};
}

export interface DOMElements {
    cube: HTMLElement;
    side: {[key: string]: HTMLElement};
    value: {[key: string]: HTMLElement};
    score: HTMLElement;
    max: HTMLCollectionOf<Element>;
    increment: HTMLElement;
}

export interface InfoParams {
    top: string;
    header: string | number;
    text: string;
    color?: number[];
} 