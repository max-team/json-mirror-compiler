/**
 * js、php 都会用到的逻辑
 */

const parsers = {
    json: JSON.parse,
    json5: function (source) {
        return require('json5').parse(source);
    },
    yaml: function (source) {
        return require('js-yaml').safeLoad(source);
    }
};

export function compileTarget(
    source: string,
    CodeBuffer: any,
    options: {
        rootVar: string;
        filePath: string;
        format: string;
        getNamespace?: (file: string) => string;
        target?: 'commonjs' | 'amd';
    }
): {code: string; errors?: object[];} {
    const {
        format,
        getNamespace
    } = options;
    const buffer = new CodeBuffer({
        root: options.rootVar,
        filePath: options.filePath,
        target: options.target
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

    if ('$template' in json) {
        delete json.$template;
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
