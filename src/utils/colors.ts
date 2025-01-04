export function get_color(value: number | string): number[] {
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