const pointerReg = /^#\//;
const variableReg = /^\$\//;

/**
 * 判断是否是 #/ 路径语法
 *
 * @param {any} s
 */
export function isPointer(s: any) {
    return typeof s === 'string' && pointerReg.test(s);
}

/**
 * 判断是否是 $/ 路径语法
 * 
 * @param {any} s
 */
export function isVariable(s: any) {
    return typeof s === 'string' && variableReg.test(s);
}

/**
 * 判断是否是 {{ }} mustache 语法，拼接变量与字符串
 *
 * @param {any} s
 */
export function isMustache(s: any) {
    return typeof s === 'string' && /{{\s*#\/.+?(?=}})/.test(s);
}

export function getPath(str: string) {
    let path = str.replace(pointerReg, '').split('/').filter(a => a);
    return path;
}

export function getVariable(str: string) {
    return str.replace(variableReg, '');
}

export function getFromPath(str: string, parentPath: ParentPath) {
    let path = getPath(str);
    let isRoot = false;
    if (path[0] === '~') {
        isRoot = true;
        path = path.slice(1);
    }
    return {
        path,
        parentPath: parentPath ? (isRoot ? { ...parentPath, from: [] } : { ...parentPath }) : parentPath
    };
}