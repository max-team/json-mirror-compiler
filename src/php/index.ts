/**
 * @file generator ts code from mirror
 * @author cxtom(cxtom2008@gmail.com)
 */

import CodeBuffer from './CodeBuffer';
import {compileTarget} from '../common';

export function compile(
    options: {
        source: string;
        rootVar?: string;
        format?: 'json' | 'json5' | 'yaml';
        filePath?: string;
        getNamespace?: (file: string) => string;
    }
): {code: string; errors?: object[];} {

    let errors = [];
    let code = '';

    const {
        source,
        rootVar,
        format = 'json',
        filePath,
        getNamespace
    } = options;


    const res = compileTarget(source, CodeBuffer, {
        rootVar,
        filePath,
        format,
        getNamespace
    });
    code = res.code;
    res.errors && errors.push(...res.errors);

    return {
        code,
        errors
    };
}


