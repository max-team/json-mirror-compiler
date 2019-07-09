import {compile} from '../src/index';
import {readFile, writeFile} from 'fs';
import {promisify} from 'util';
import {resolve} from 'path';

let readFile_ = promisify(readFile);
let writeFile_ = promisify(writeFile);

(async function () {
    let fileStr = await readFile_(resolve(__dirname, './test.json'), 'utf-8');
    let res = compile({
        source: fileStr
    });
    await writeFile_(resolve(__dirname, './testRes.php'), '<?php\n' + res.code);
})();