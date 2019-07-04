/**
 * @file unit test
 * @author cxtom(cxtom2008@gmail.com)
 */

import { LegoMirrorUtil as Util } from '../index';

describe('lego-mirror: runtime', () => {

    it('basic', () => {

        const obj = {
            a: {
                b: 'c'
            }
        };

        expect(Util.get(obj, ['a', 'b'])).toBe('c');
        expect(Util.get(obj, ['1', 'b'])).toBeUndefined();

        const arr = [{
            a: 1
        }, {
            a: 2
        }];

        expect(Util.get(arr, ['1', 'a'])).toBe(2);
        expect(Util.get(obj, ['a', 'c'])).toBeUndefined();
    });

    it('null', () => {
        expect(Util.get(null, ['a', 'b'])).toBeUndefined();
    });
});
