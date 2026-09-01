export function getRandFromArray<T>(array: Array<T>) {
    return array[Math.floor(Math.random() * (0 - array.length) + array.length)];
}
