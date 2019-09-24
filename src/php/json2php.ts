/**
 * @file json2php
 * @author cxtom(cxtom2008@gmail.com)
 */

const json2php = function(obj: any): string {
    let i, result;
    switch (Object.prototype.toString.call(obj)) {
        case '[object Null]':
        case '[object Undefined]':
            result = 'null';
            break;
        case '[object String]':
            result = "'" + obj.replace(/\\/g, '\\\\').replace(/\'/g, "\\'") + "'";
            break;
        case '[object Number]':
        case '[object Boolean]':
            result = obj.toString();
            break;
        case '[object Array]':
            result = 'array(' + obj.map(json2php).join(', ') + ')';
            break;
        case '[object Object]':
            result = [];
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    result.push(json2php(i) + " => " + json2php(obj[i]));
                }
            }
            result = "array(" + result.join(", ") + ")";
            break;
        default:
            result = 'null';
    }
    return result;
};

export default json2php;
