/**
 * @file json2js
 * @author cxtom(cxtom2008@gmail.com)
 */

export default function json2js(obj: any): string {
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
            result = '[' + obj.map(json2js).join(', ') + ']';
            break;
        case '[object Object]':
            result = [];
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    result.push(json2js(i) + ": " + json2js(obj[i]));
                }
            }
            result = "{" + result.join(", ") + "}";
            break;
        default:
            result = 'null';
    }
    return result;
};
