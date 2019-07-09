/**
 * @file generator ts code from mirror
 * @author cxtom(cxtom2008@gmail.com)
 */

import CodeBuffer, {Mirror} from './CodeBuffer';

import {parse as JSON5parse} from 'json5';
import {safeLoad} from 'js-yaml';

const parsers = {
    json: JSON.parse,
    json5: JSON5parse,
    yaml: safeLoad
};

export default function compile(
    options: {
        source: string,
        rootVar?: string,
        format?: 'json' | 'json5' | 'yaml'
    }
): {code: string, errors?: object[]} {

    let json;

    const {
        source,
        rootVar,
        format = 'json'
    } = options;

    try {
        json = parsers[format](source) as Mirror;
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

    const buffer = new CodeBuffer({
        root: rootVar
    });

    if ('$title' in json) {
        delete json.$title;
    }

    buffer.walk(json);

    const code = buffer.toString();

    return {
        code,
        errors: []
    };

}

