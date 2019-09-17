export function get() {

}

export function set(obj: any, path: string[], value: any) {
    let target = obj;
    path.forEach((key, index) => {
        if (index === path.length - 1) {
            target[key] = value;
        }
        else if (!target[key] || typeof target[key] !== 'object') {
            if (isNaN(+path[index + 1])) {
                target[key] = {};
            }
            else {
                target[key] = [];
            }
        }
        target = target[key];
    });

    return obj;
}
