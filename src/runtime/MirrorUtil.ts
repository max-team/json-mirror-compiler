/**
 * @file lego mirror
 * @author cxtom(cxtom2008@gmail.com)
 */

export default class LegoMirrorUtil {

    static get (obj: object, path: string[]): any {

        if (obj == null) {
            return;
        }

        let key = path.shift();
        let ret = obj;

        while (key) {
            if (ret == null) {
                return;
            }
            ret = ret[key];
            key = path.shift();
        }

        return ret;
    }
}
