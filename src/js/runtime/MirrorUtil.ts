export function get(obj: any, path: string[]) {
    let target = obj;
    try {
        path.forEach((key, index) => {
            target = target[key];
        });
    }
    catch(e) {
        return undefined;
    }
    return target;
}

export function set(obj: any, path: string[], value: any) {

    if (!obj) {
        obj = isNaN(+path[0]) ? {} : [];
    }

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
