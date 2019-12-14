/**
 * @file generator
 * @author cxtom(cxtom2008@gmail.com)
 */

import { compile } from '../index';

describe('compiler', () => {

    it('prefix', () => {
        const result = compile({
            source: `{"#/title": "#/main_title"}`
        });

        expect(result.code.php).toContain('$newData = array();');
    });

    it('string pointer', () => {
        const result = compile({
            source: `{"#/title": "#/main_title"}`
        });

        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'title\'), $tplData[\'main_title\']);');
    });

    it('string constant', () => {

        const result = compile({
            source: `{
                "#/title": "标题",
                "#/isbaiduboxapp": true,
                "#/shownum": 10,
                "#/labels": ["惠"],
                "#/obj": {
                    "a": 1
                }
            }`
        });

        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'title\'), \'标题\');');
        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'isbaiduboxapp\'), true);');
        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'shownum\'), 10);');
        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'labels\'), array(\'惠\'));');
        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'obj\'), array(\'a\' => 1));');
    });

    it('string mustache', () => {

        const result = compile({
            source: `{
                "#/text1": "tel:{{#/tel/0/hot}}",
                "#/text2": "tel:{{ #/tel/0/hot }}abc {{ #/aa/1/sj}} 666",
                "#/text3": "tel:{{ #/tel/0/hot }}abc {{ #/aa/1/sj}} 666 {{ cc/2/kkk}} 777 "
            }`
        });

        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'text1\'), \'tel:\' . $tplData[\'tel\'][\'0\'][\'hot\']);');
        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'text2\'), \'tel:\' . $tplData[\'tel\'][\'0\'][\'hot\'] . \'abc \' . $tplData[\'aa\'][\'1\'][\'sj\'] . \' 666\');');
        expect(result.code.php).toContain('LegoMirrorUtil::set($newData, array(\'text3\'), \'tel:\' . $tplData[\'tel\'][\'0\'][\'hot\'] . \'abc \' . $tplData[\'aa\'][\'1\'][\'sj\'] . \' 666 {{ cc/2/kkk}} 777 \');');
    });

    it('copy action - object', () => {
        const result = compile({
            source: `{
                "#/objA": {
                    "$from": "#/objB",
                    "$data": {
                        "$mirror": {
                            "#/title": "#/main_title"
                        }
                    }
                }
            }`
        });
        expect(result.code.php).toContain('if (isset($tplData[\'objB\']))');
        expect(result.code.php).toContain('if (!isset($newData[\'objA\']))');
        expect(result.code.php).toContain(`LegoMirrorUtil::set($newData['objA'], array('title'), $tplData['objB']['main_title']);`);

    });


    it('copy action - array', () => {
        const result = compile({
            source: `{
                "#/arrA": {
                    "$from": "#/objB",
                    "$data": {
                        "$type": "array",
                        "$mirror": {
                            "#/title": "#/main_title"
                        }
                    }
                }
            }`
        });
        expect(result.code.php).toContain(`if (!empty($tplData['objB']) && !isset($tplData['objB'][0])) {\n$tplData['objB'] = array($tplData['objB']);\n}`);
        expect(result.code.php).toContain(`LegoMirrorUtil::set($newData, array('arrA', $i), array());`);
    });

    it('copy action - array maxItems', () => {
        const result = compile({
            source: `{
                "#/arrA": {
                    "$from": "#/objB",
                    "$data": {
                        "$type": "array",
                        "$mirror": {
                            "#/title": "#/main_title"
                        },
                        "$maxItems": 3
                    }
                }
            }`
        });
        expect(result.code.php).toContain(`$tplData['objB'] = array_slice($tplData['objB'], 0, 3);`);
    });

    it('copy action - array use root', () => {
        const result = compile({
            source: `{
                "#/arrA": {
                    "$from": "#/objB",
                    "$data": {
                        "$type": "array",
                        "$mirror": {
                            "#/title": "#/main_title",
                            "#/image": "#/~/image",
                            "#/des": "#/des"
                        }
                    }
                }
            }`
        });
        expect(result.code.php).toContain(`LegoMirrorUtil::set($newData['arrA'][$i], array('image'), $tplData['image']);`);
        expect(result.code.php).toContain(`LegoMirrorUtil::set($newData['arrA'][$i], array('des'), $tplData['objB'][$i]['des']);`);
    });
});
