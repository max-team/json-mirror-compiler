/**
 * @file generator
 * @author cxtom(cxtom2008@gmail.com)
 */

import { compile, compileJS } from '../index';

describe('compiler', () => {

    it('prefix', () => {
        const result = compile({
            source: `{"#/title": "#/main_title"}`
        });

        expect(result.code.js).toContain('var $newData;');
    });

    it('string pointer', () => {
        const result = compile({
            source: `{"#/title": "#/main_title"}`
        });

        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['title'], legoMirrorUtil.get($tplData, ['main_title']));");
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

        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['title'], '标题');");
        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['isbaiduboxapp'], true);");
        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['shownum'], 10);");
        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['labels'], ['惠']);");
        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['obj'], {'a': 1});");
    });

    it('string mustache', () => {

        const result = compile({
            source: `{
                "#/text1": "tel:{{#/tel/0/hot}}",
                "#/text2": "tel:{{ #/tel/0/hot }}abc {{ #/aa/1/sj}} 666",
                "#/text3": "tel:{{ #/tel/0/hot }}abc {{ #/aa/1/sj}} 666 {{ cc/2/kkk}} 777 ",
                "#/objA": {
                    "$from": "#/objB",
                    "$data": {
                        "$mirror": {
                            "#/title": "{{#/main_title}} 123"
                        }
                    }
                }
            }`
        });

        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['text1'], 'tel:' + (legoMirrorUtil.get($tplData, ['tel', '0', 'hot']) || ''));");
        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['text2'], 'tel:' + (legoMirrorUtil.get($tplData, ['tel', '0', 'hot']) || '') + 'abc ' + (legoMirrorUtil.get($tplData, ['aa', '1', 'sj']) || '') + ' 666');");
        expect(result.code.js).toContain("legoMirrorUtil.set($newData, ['text3'], 'tel:' + (legoMirrorUtil.get($tplData, ['tel', '0', 'hot']) || '') + 'abc ' + (legoMirrorUtil.get($tplData, ['aa', '1', 'sj']) || '') + ' 666 {{ cc/2/kkk}} 777 ');");
        expect(result.code.js).toContain("$newData['objA'] =");
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
        expect(result.code.js).toContain('if (legoMirrorUtil.get($tplData, [\'objB\']) != null)');
        expect(result.code.js).toContain('if (legoMirrorUtil.get($newData, [\'objA\']) == null)');
        expect(result.code.js).toContain(`legoMirrorUtil.set($newData, ['objA'], {});`);
        expect(result.code.js).toContain(`legoMirrorUtil.set($newData['objA'], ['title'], legoMirrorUtil.get($tplData['objB'], ['main_title']));`);

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
        expect(result.code.js).toContain(`if (legoMirrorUtil.get($tplData, ['objB']) != null) {\nif (!Array.isArray($tplData['objB'])) {\n$tplData['objB'] = [$tplData['objB']];`);
        expect(result.code.js).toContain(`legoMirrorUtil.set($newData, ['arrA', $i], {});`);
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
        expect(result.code.js).toContain(`$tplData['objB'] = $tplData['objB'].slice(0, 3);`);
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
        expect(result.code.js).toContain(`legoMirrorUtil.set($newData['arrA'][$i], ['image'], legoMirrorUtil.get($tplData, ['image']));`);
        expect(result.code.js).toContain(`legoMirrorUtil.set($newData['arrA'][$i], ['des'], legoMirrorUtil.get($tplData['objB'][$i], ['des']));`);
    });

    it('amd js', () => {
        const result = compileJS({
            source: `{"#/title": "#/main_title"}`,
            target: 'amd'
        });

        expect(result.code).toContain('var $newData;');
        expect(result.code).toContain('return $newData;');
        expect(result.code).not.toContain('module.exports');
        expect(result.code).not.toContain('require(\'json-mirror-compiler/lib/js/runtime/MirrorUtil\')');
    });

    it('set publicPath', () => {
        const result = compileJS({
            source: `{"#/title": "#/main_title"}`,
            publicPath: '../../node_modules'
        });

        expect(result.code).toContain(`const legoMirrorUtil = require('../../node_modules/json-mirror-compiler/lib/js/runtime/MirrorUtil');`);
    });
});
