export function get() {

}

export function set(obj: any, path: string[], value: any) {
    let target = obj;
    path.forEach((key, index) => {
        if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
        }
        if (index === path.length - 1) {
            target[key] = value;
        }
        target = target[key];
    });

    return obj;
}
