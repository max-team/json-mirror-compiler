/**
 * @file generator ts code from mirror
 * @author cxtom(cxtom2008@gmail.com)
 */

import {compile as compileJS} from './js/index';
import {compile as compilePHP} from './php/index';

const compilers = {
    js: compileJS,
    php: compilePHP
};

export default function compile(
    options: {
        source: string;
        rootVar?: string;
        extVar?: string;
        format?: 'json' | 'json5' | 'yaml';
        filePath?: string;
        variable?: string;
        afterProcess?: object;
        target?: {
            php: boolean;
            js: boolean;
        },
        getNamespace?: (file: string) => string;
    }
): {code: {[key: string]: string}; errors?: object[];} {

    let errors = [];
    let code = {};

    const {
        source,
        rootVar,
        format = 'json',
        filePath,
        variable,
        afterProcess,
        target = {php: true, js: true},
        getNamespace
    } = options;

    if (!Object.keys(target).find(key => target[key])) {
        console.error('please specify at least one target');
        return {
            code: {},
            errors: []
        };
    }

    Object.keys(target).forEach(key => {
        if (target[key] && compilers[key]) {
            const res = compilers[key]({
                source,
                rootVar,
                format,
                filePath,
                variable,
                afterProcess,
                getNamespace
            });
            code[key] = res.code;
            res.errors && errors.push(...res.errors);
        }
    });

    return {
        code,
        errors
    };
}


