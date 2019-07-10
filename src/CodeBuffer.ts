/**
 * @file code buffer util
 * @author cxtom(cxtom2008@gmail.com)
 */

import json2php from './json2php';

const U = 'LegoMirrorUtil';

interface MirrorData {
    $type: 'array' | 'object';
    $mirror: Mirror;
    $maxItems?: number;
}

interface MirrorAction {
    $from: string;
    $action?: 'copy';
    $data?: string | MirrorData;
}

type Constant = string | number | boolean | object | any[];

interface ParentPath {
    from: string[];
    to: string[];
}

export interface Mirror {
    [key: string]: string | Constant | MirrorAction;
}

enum CodeType {
    line,
    raw
}

type Buffer = Array<{
    type: CodeType,
    code: string
}>

const pointerReg = /^#\//;

/**
 * 判断是否是 #/ 路径语法
 *
 * @param {any} s
 */
function isPointer(s: any) {
    return typeof s === 'string' && pointerReg.test(s);
}

/**
 * 判断是否是 {{ }} mustache 语法，拼接变量与字符串
 *
 * @param {any} s
 */
function isMustache(s: any) {
    return typeof s === 'string' && /{{\s*#\/.+?(?=}})/.test(s);
}

function getPath(str: string) {
    let path = str.replace(pointerReg, '').split('/').filter(a => a);
    return path;
}

function getFromPath(str: string, parentPath: ParentPath) {
    let path = getPath(str);
    if (path[0] === '~') {
        if (parentPath) {
            parentPath.from = [];
        }
        return path.slice(1);
    }
    return path;
}

const tracer = 'ijkhlmn';

export default class CodeBuffer {

    private trackerIndex: number;

    buffer: Buffer;
    root: string;
    filePath: string;

    constructor(options?: {root?: string; filePath?: string}) {
        this.buffer = [{
            type: CodeType.line,
            code: '$newData = array()'
        }];
        this.trackerIndex = 0;
        this.root = options.root || '$tplData';
        this.filePath = options.filePath;
    }

    transformGetter(path: string[], variable: string) {
        let p = `${variable}${path.map(p => `[${/^\$/.test(p) ? p : json2php(p)}]`).join('')}`;
        return p;
    }

    transfromSetter(to: string[], setter: string, content: string) {
        return `${U}::set(${setter}, array(${to.map(t => /^\$/.test(t) ? t : json2php(t)).join(', ')}), ${content})`
    }

    getParams(parentPath?: ParentPath) {

        let getter = this.root;
        let setter = '$newData';

        if (parentPath && parentPath.from.length > 0) {
            getter = this.transformGetter(parentPath.from, getter);
        }

        if (parentPath && parentPath.to.length > 0) {
            setter = this.transformGetter(parentPath.to, setter);
        }

        return { getter, setter };
    }

    fromPath(from: string[], to: string[], parentPath?: ParentPath) {
        const { getter, setter } = this.getParams(parentPath);
        let p = {
            type: CodeType.line,
            code: this.transfromSetter(to, setter, this.transformGetter(from, getter))
        };
        this.buffer.push(p);
    }

    fromConstant(constant: any, to: string[], parentPath?: ParentPath) {
        const { setter } = this.getParams(parentPath);
        let p = {
            type: CodeType.line,
            code: this.transfromSetter(to, setter, json2php(constant))
        };
        this.buffer.push(p);
    }

    /**
     * 解析 {{ }} 语法
     *
     * @param from
     * @param to
     * @param parentPath
     */
    fromMustache(from: string, to: string[], parentPath?: ParentPath) {
        const { getter, setter } = this.getParams(parentPath);
        let regExp = /{{\s*#\/.+?(?=}})/g;
        // 通过正则匹配得到变量数组
        let varArray = from.match(regExp);
        // 总数组，包括常量和变量，需要记录顺序
        let array = [];
        // 临时字符串，每次循环都会改变；第一次为 from
        let tmpStr = from;
        for (let i = 0; i < varArray.length; i++) {
            // 按变量进行分割，该数组只能有两个元素
            let strArray = tmpStr.split(varArray[i]);
            // 左边是常量，需要去除 }}，不能去除空格
            array.push({
                type: 'const',
                val: strArray[0].replace('}}', '')
            });
            // 分隔符是变量，需要去除 {{，需要去除空格
            array.push({
                type: 'val',
                val: varArray[i].replace('{{', '').trim()
            });
            // 右侧再次赋值给 tmpStr，进行下一次循环
            tmpStr = strArray[1];
        }
        // 循环结束后，添加最后一个常量；如果 tmpStr 为空，就不需要了
        let lastConst = tmpStr.replace('}}', '');
        if (lastConst) {
            array.push({
                type: 'const',
                val: lastConst
            });
        }
        // 拼接代码
        let code = '';
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            if (item.type === 'val') {
                let valCode = this.transformGetter(getPath(item.val), getter);
                code += i !== array.length - 1
                    ? `${valCode} . `
                    : valCode;
            }
            else {
                code += i !== array.length - 1
                    ? `'${item.val}' . `
                    : `'${item.val}'`;
            }
        }
        let p = {
            type: CodeType.line,
            code: this.transfromSetter(to, setter, code)
        };
        this.buffer.push(p);
    }

    addCopy(from: string, to: string[], data: MirrorData, parentPath?: ParentPath) {

        const { $type = 'object', $mirror } = data;

        // 直接传值
        if (!$mirror) {
            isPointer(from)
                ? this.fromPath(getPath(from), to, parentPath)
                : this.fromConstant(from, to, parentPath);
            return;
        }

        if (!parentPath) {
            parentPath = { from: [], to: [] };
        }

        if ($type === 'object' && isPointer(from)) {
            let fromPath = getFromPath(from, parentPath);
            const { setter, getter } = this.getParams({from: fromPath, to});
            this.buffer.push({
                type: CodeType.raw,
                code: `if (isset(${getter})) {\nif (!isset(${setter})) {`
            });
            this.fromConstant([], to, parentPath);
            this.buffer.push({
                type: CodeType.raw,
                code: `}`
            });
            this.walk($mirror, {
                from: [ ...parentPath.from, ...fromPath],
                to: [ ...parentPath.to, ...to ]
            });
            this.buffer.push({
                type: CodeType.raw,
                code: `}`
            });
            return;
        }

        if ($type === 'object') {
            this.fromConstant(from, to, parentPath);
            return;
        }

        if ($type === 'array') {
            let fromPath = getFromPath(from, parentPath);
            const { setter, getter } = this.getParams({
                from: [ ...parentPath.from, ...fromPath],
                to: [ ...parentPath.to, ...to
            ]});
            this.buffer.push({
                type: CodeType.raw,
                code: `if (isset(${getter})) {\nif (!empty(${getter}) && !isset(${getter}[0])) {\n${getter} = array(${getter});\n}`
            });
            if (data.$maxItems) {
                this.buffer.push({
                    type: CodeType.raw,
                    code: `${getter} = array_slice(${getter}, 0, ${data.$maxItems});`
                });
            }
            const tracerVar = `$${tracer[this.trackerIndex]}`;
            this.trackerIndex++;

            this.buffer.push({
                type: CodeType.raw,
                code: `foreach (${getter} as ${tracerVar} => $item) {\nif (!isset(${setter}[${tracerVar}])) {`
            });

            this.fromConstant([], [...to, tracerVar], parentPath);
            this.buffer.push({
                type: CodeType.raw,
                code: `}`
            });

            this.walk($mirror, {
                from: [ ...parentPath.from, ...fromPath, tracerVar],
                to: [ ...parentPath.to, ...to, tracerVar ]
            });

            this.buffer.push({
                type: CodeType.raw,
                code: `}\n}`
            });
        }
    }

    walk(mirror: Mirror, parentPath?: ParentPath) {
        for (let [to, from] of Object.entries(mirror)) {
            const toPath = getPath(to);
            if (typeof from === 'string') {
                if (isPointer(from)) {
                    let fromPath = getFromPath(from as string, parentPath);
                    this.fromPath(fromPath, toPath, parentPath);
                }
                else if (isMustache(from)) {
                    this.fromMustache(from, toPath, parentPath);
                }
                else {
                    this.fromConstant(from, toPath, parentPath);
                }
            }
            else if (
                ['number', 'boolean'].includes(typeof from)
                || Array.isArray(from)
                || !(from as MirrorAction).$from
            ) {
                this.fromConstant(from, toPath, parentPath);
            }
            else if (typeof from === 'object' && (from as MirrorAction).$from) {
                const {$from, $action = 'copy', $data} = from as MirrorAction;
                switch ($action) {
                    case 'copy':
                        if (typeof $data === 'object') {
                            this.addCopy($from, toPath, $data, parentPath);
                        }
                    default:
                        break;
                }
            }
        }
    }

    addPreprocesser(preprocesser: string, getNamespace?: (file: string) => string) {
        this.buffer.push({
            type: CodeType.raw,
            code: `\
require_once(dirname(__FILE__) . '/' . ${JSON.stringify(preprocesser.replace(/\.(ts|php)$/, '') + '.php')});
${this.root} = array_merge(${this.root}, ${getNamespace(preprocesser)}\\process(${this.root}));`
        });
    }

    toString() {
        return this.buffer
            .map(a => a.code + (a.type === CodeType.line ? ';' : ''))
            .join('\n');
    }
}
