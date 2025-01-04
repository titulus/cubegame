export function unique(arr: (number | string)[]): number[] {
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