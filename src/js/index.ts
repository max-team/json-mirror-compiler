import CodeBuffer from './CodeBuffer';
import {compileTarget} from '../common';
import * as mirrorUtil from './runtime/MirrorUtil';

export function compile(
    options: {
        source: string;
        rootVar?: string;
        variable?: string;
        afterProcess?: object;
        format?: 'json' | 'json5' | 'yaml';
        filePath?: string;
        target?: 'commonjs' | 'amd';
        // set absolute path prefix for dep module
        publicPath?: string;
    }
): {code: string; errors?: object[];} {

    let errors = [];
    let code = '';

    const {
        source,
        rootVar,
        format = 'json',
        filePath,
        target = 'commonjs',
        variable,
        afterProcess,
        publicPath
    } = options;

    const res = compileTarget(source, CodeBuffer, {
        rootVar,
        filePath,
        format,
        target,
        variable,
        afterProcess,
        publicPath
    });
    code = res.code;
    res.errors && errors.push(...res.errors);

    return {
        code,
        errors
    };
}
export const legoMirrorUtil = mirrorUtil;
