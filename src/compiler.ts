/**
 * @file generator ts code from mirror
 * @author cxtom(cxtom2008@gmail.com)
 */

import CodeBuffer, {Mirror} from './CodeBuffer';

export default function compile(
    options: {
        source: string,
        rootVar?: string
    }
): {code: string, errors?: object[]} {

    let json;

    const {
        source,
        rootVar
    } = options;

    try {
        json = JSON.parse(source) as Mirror;
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

