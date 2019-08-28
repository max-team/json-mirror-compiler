/**
 * @file generator ts code from mirror
 * @author cxtom(cxtom2008@gmail.com)
 */

import CodeBufferPHP from './php/CodeBuffer';
import CodeBufferJS from './js/CodeBuffer';

const parsers = {
    json: JSON.parse,
    json5: function (source) {
        return require('json5').parse(source);
    },
    yaml: function (source) {
        return require('js-yaml').safeLoad(source);
    }
};

const codeBuffers = {
    js: CodeBufferJS,
    php: CodeBufferPHP
};

export default function compile(
    options: {
        source: string;
        rootVar?: string;
        format?: 'json' | 'json5' | 'yaml';
        filePath?: string;
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
        if (target[key] && codeBuffers[key]) {
            const res = compileTarget(key as keyof typeof codeBuffers);
            code[key] = res.code;
            res.errors && errors.push(...res.errors);
        }
    });

    return {
        code,
        errors
    };

    function compileTarget(target: keyof typeof codeBuffers): {code: string; errors?: object[];} {
        const CodeBuffer = codeBuffers[target];
        const buffer = new CodeBuffer({
            root: rootVar,
            filePath
        });
        let json: Mirror;
    
        try {
            json = (parsers[format](source) as Mirror);
        }
        catch (e) {
            console.error(`json parse error: ` + e.message);
            return {
                code: '',
                errors: [{
                    code: 1,
                    message: 'json parse error: ' + e.message
                }]
            };
        }
    
        if ('$title' in json) {
            delete json.$title;
        }
    
        if ('$preprocesser' in json) {
            const preprocesser = json.$preprocesser;
            buffer.addPreprocesser(preprocesser as string, getNamespace);
            delete json.$preprocesser;
        }
        buffer.walk(json);
        const code = buffer.toString();
        return {
            code,
            errors: []
        }
    }
}


