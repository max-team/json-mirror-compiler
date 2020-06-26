import CodeBuffer from './CodeBuffer';
import {compileTarget} from '../common';
import * as mirrorUtil from './runtime/MirrorUtil';

export function compile(
    options: {
        source: string;
        rootVar?: string;
        format?: 'json' | 'json5' | 'yaml';
        filePath?: string;
        target?: 'commonjs' | 'amd';
    }
): {code: string; errors?: object[];} {

    let errors = [];
    let code = '';

    const {
        source,
        rootVar,
        format = 'json',
        filePath,
        target = 'commonjs'
    } = options;

    const res = compileTarget(source, CodeBuffer, {
        rootVar,
        filePath,
        format,
        target
    });
    code = res.code;
    res.errors && errors.push(...res.errors);

    return {
        code,
        errors
    };
}
export const legoMirrorUtil = mirrorUtil;
