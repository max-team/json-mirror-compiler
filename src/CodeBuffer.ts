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
    $action?: 'cat' | 'copy' | 'merge';
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

function isPointer(s: any) {
    return typeof s === 'string' && /^#\//.test(s);
}

function getPath(str: string) {
    return str.slice(2).split('/').filter(a => a);
}


const tracer = 'ijkhlmn';

export default class CodeBuffer {

    buffer: Buffer;

    root: string;

    trackerIndex: number;

    constructor(options?: {root?: string}) {
        this.buffer = [{
            type: CodeType.line,
            code: '$newData = array()'
        }];
        this.trackerIndex = 0;
        this.root = options.root || '$tplData';
    }

    transformGetter(path: string[], variable: string) {
        return `${variable}${path.map(p => `[${/^\$/.test(p) ? p : json2php(p)}]`).join('')}`;
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
        this.buffer.push({
            type: CodeType.line,
            code: this.transfromSetter(to, setter, this.transformGetter(from, getter))
        });
    }

    fromConstant(constant: any, to: string[], parentPath?: ParentPath) {
        const { setter } = this.getParams(parentPath);
        this.buffer.push({
            type: CodeType.line,
            code: this.transfromSetter(to, setter, json2php(constant))
        });
    }

    addCat(from: string, to: string[], data: any, parentPath?: ParentPath) {
        const dataContent = isPointer(data) ? this.transformGetter(getPath(data), this.root) : json2php(data);
        const { setter } = this.getParams(parentPath);
        if (isPointer(from)) {
            const getter = this.transformGetter(getPath(from), this.root);
            this.buffer.push({
                type: CodeType.line,
                code: this.transfromSetter(to, setter, `(isset(${getter}) ? ${getter} : '') . (${dataContent})`)
            });
        }
        else {
            this.buffer.push({
                type: CodeType.line,
                code: this.transfromSetter(to, setter, `(${json2php(data)}) . (${dataContent})`)
            });
        }
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
            const fromPath = getPath(from);
            const { setter, getter } = this.getParams({from: fromPath, to});
            this.buffer.push({
                type: CodeType.raw,
                code: `if (isset(${getter})) {`
            });
            this.buffer.push({
                type: CodeType.raw,
                code: `if (!isset(${setter})) {`
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
            const fromPath = getPath(from);
            const { setter, getter } = this.getParams({
                from: [ ...parentPath.from, ...fromPath],
                to: [ ...parentPath.to, ...to
            ]});
            this.buffer.push({
                type: CodeType.raw,
                code: `if (isset(${getter})) {`
            });

            this.buffer.push({
                type: CodeType.raw,
                code: `if (!empty(${getter}) && !isset(${getter}[0])) {\n${getter} = array(${getter});\n}`
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
                code: `foreach (${getter} as ${tracerVar} => $item) {`
            });

            this.buffer.push({
                type: CodeType.raw,
                code: `if (!isset(${setter}[${tracerVar}])) {`
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
                isPointer(from)
                    ? this.fromPath(getPath(from as string), toPath, parentPath)
                    : this.fromConstant(from, toPath, parentPath);
            }
            else if (
                ['number', 'boolean', 'string'].includes(typeof from)
                || Array.isArray(from)
                || !(from as MirrorAction).$from
            ) {
                this.fromConstant(from, toPath, parentPath);
            }
            else if (typeof from === 'object' && (from as MirrorAction).$from) {
                const {$from, $action = 'copy', $data} = from as MirrorAction;
                switch ($action) {
                    case 'cat':
                        if (typeof $data !== 'object' && typeof $from === 'string') {
                            this.addCat($from, toPath, $data, parentPath);
                        }
                        break;
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

    toString() {
        return this.buffer.map(a => a.code + (a.type === CodeType.line ? ';' : '')).join('\n');
    }
}
