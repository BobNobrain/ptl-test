const tObj = typeof {};
const tFun = typeof Function;

function isPrimitive(v) {
    const t = typeof v;
    if (t === tObj) return v === null;
    if (t === tFun) return false;
    return true;
}

class PtlLayer {
    constructor(name, init) {
        this.name = name;
        this._init = init;
        this.root = null;
    }

    init() {
        this.root = this._init();
    }

    getObject(path) {
        let _path = path.slice();
        let obj = this.root;
        while (_path.length) {
            if (isPrimitive(obj))
                throw new ReferenceError(`Path "${path.join}" does not exist on layer ${this}`);
            obj = obj[_path[0]];
            _path.shift();
        }
        return obj;
    }

    call(path, args) {
        const methodName = path[path.length - 1];
        path.pop();
        const object = this.getObject(path);
        if (typeof object[methodName] === typeof Function) {
            return object[methodName](args);
        } else {
            throw new TypeError(`Cannot call "${path.join('.')}": not a function`);
        }
    }

    getName() {
        return this.name;
    }

    toString() {
        return `[PtlLayer "${this.name}"]`;
    }
}

module.exports = PtlLayer;
