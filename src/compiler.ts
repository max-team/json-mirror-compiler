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

export default function compile(
    options: {
        source: string;
        rootVar?: string;
        format?: 'json' | 'json5' | 'yaml';
        filePath?: string;
        getNamespace?: (file: string) => string;
    }
): {phpCode: string; jsCode: string; errors?: object[];} {

    let jsonForPHP;
    let jsonForJS;

    const {
        source,
        rootVar,
        format = 'json',
        filePath,
        getNamespace
    } = options;

    try {
        // jsonForPHP = parsers[format](source) as Mirror;
        jsonForJS = parsers[format](source) as Mirror;
    }
    catch (e) {
        console.error(`json parse error: ` + e.message);
        return {
            phpCode: '',
            jsCode: '',
            errors: [{
                code: 1,
                message: 'json parse error: ' + e.message
            }]
        };
    }

    // const phpBuffer = new CodeBufferPHP({
    //     root: rootVar,
    //     filePath
    // });
    const jsBuffer = new CodeBufferJS({
        root: rootVar,
        filePath
    });

    if ('$title' in jsonForJS) {
        delete jsonForPHP.$title;
        delete jsonForJS.$title;
    }

    if ('$preprocesser' in jsonForJS) {
        const preprocesser = jsonForPHP.$preprocesser;
        // phpBuffer.addPreprocesser(preprocesser, getNamespace);
        jsBuffer.addPreprocesser(preprocesser, getNamespace);
        // delete jsonForPHP.$preprocesser;
        delete jsonForJS.$preprocesser;
    }

    // phpBuffer.walk(jsonForPHP);
    jsBuffer.walk(jsonForJS);

    // const phpCode = phpBuffer.toString();
    const jsCode = jsBuffer.toString();

    return {
        phpCode: '',
        jsCode,
        errors: []
    };

}

