import {compile} from '../index';
import {readFile, writeFile} from 'fs';
import {promisify} from 'util';

let readFile_ = promisify(readFile);
let writeFile_ = promisify(writeFile);

(async function () {
    let fileStr = await readFile_('./test.json', 'utf-8');
    let res = compile({
        source: fileStr
    });
    await writeFile_('./testRes.php', '<?php\n' + res.code);
})();