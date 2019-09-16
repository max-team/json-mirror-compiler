import CodeBuffer from './CodeBuffer';
import {compileTarget} from '../common';

export function compile(
    options: {
        source: string;
        rootVar?: string;
        format?: 'json' | 'json5' | 'yaml';
        filePath?: string;
    }
): {code: string; errors?: object[];} {
    
    let errors = [];
    let code = '';

    const {
        source,
        rootVar,
        format = 'json',
        filePath
    } = options;

    const res = compileTarget(source, CodeBuffer, {
        rootVar,
        filePath,
        format
    });
    code = res.code;
    res.errors && errors.push(...res.errors);

    return {
        code,
        errors
    };
}