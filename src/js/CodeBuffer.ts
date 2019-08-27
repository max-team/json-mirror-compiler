import {
    getPath,
    isPointer,
    getFromPath
} from "../utils";
import json2js from './json2js';

enum CodeType {
    line,
    raw
}

const U = 'legoMirrorUtil';

type Buffer = Array<{
    type: CodeType,
    code: string
}>

export default class CodeBuffer {
    private trackerIndex: number;

    buffer: Buffer;
    root: string;
    filePath: string;

    constructor(options?: {root?: string; filePath?: string}) {
        this.buffer = [{
            type: CodeType.line,
            code: '$newData = {}'
        }];
        this.trackerIndex = 0;
        this.root = options.root || '$tplData';
        this.filePath = options.filePath;
    }

    walk(mirror: Mirror, parentPath?: ParentPath) {
        for (let [to, from] of Object.entries(mirror)) {
            const toPath = getPath(to);
            if (typeof from === 'string') {
                if (isPointer(from)) {
                    let fromPath = getFromPath(from as string, parentPath);
                    this.fromPath(fromPath, toPath, parentPath);
                }
                // else if (isMustache(from)) {
                //     this.fromMustache(from, toPath, parentPath);
                // }
                // else {
                //     this.fromConstant(from, toPath, parentPath);
                // }
            }
            // else if (
            //     ['number', 'boolean'].includes(typeof from)
            //     || Array.isArray(from)
            //     || !(from as MirrorAction).$from
            // ) {
            //     this.fromConstant(from, toPath, parentPath);
            // }
            // else if (typeof from === 'object' && (from as MirrorAction).$from) {
            //     const {$from, $action = 'copy', $data} = from as MirrorAction;
            //     switch ($action) {
            //         case 'copy':
            //             if (typeof $data === 'object') {
            //                 this.addCopy($from, toPath, $data, parentPath);
            //             }
            //         default:
            //             break;
            //     }
            // }
        }
    }

    fromPath(from: string[], to: string[], parentPath?: ParentPath) {
        const { getter, setter } = this.getParams(parentPath);
        let p = {
            type: CodeType.line,
            code: this.transfromSetter(to, setter, this.transformGetter(from, getter))
        };
        this.buffer.push(p);
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

    transformGetter(path: string[], variable: string) {
        let p = `${variable}${path.map(p => `[${/^\$/.test(p) ? p : json2js(p)}]`).join('')}`;
        return p;
    }

    transfromSetter(to: string[], setter: string, content: string) {
        return `${U}.set(${setter}, [${to.map(t => /^\$/.test(t) ? t : json2js(t)).join(', ')}], ${content})`
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