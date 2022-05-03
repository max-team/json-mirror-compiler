interface Mirror {
    [key: string]: string | Constant | MirrorAction;
}

type Constant = string | number | boolean | object | any[];

interface MirrorAction {
    $from: string;
    $action?: 'copy';
    $data?: string | MirrorData;
}

interface MirrorData {
    $type: 'array' | 'object';
    $mirror: Mirror;
    $maxItems?: number;
}

interface ParentPath {
    from: string[];
    to: string[];
}

interface CodeBufferOptions {
    root?: string;
    filePath?: string;
    variable?: string;
    afterProcess?: object;
    target?: 'commonjs' | 'amd';
    publicPath?: string;
}
