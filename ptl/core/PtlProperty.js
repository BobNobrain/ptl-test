const { typename } = require('../util');
const { IllegalAccessError, abstract } = require('../util/errors');

class PtlProperty {
    constructor(value) {
        this.name = null;
        this._value = value;
        this._internal = false;
        this._allow = {
            r: true,
            w: false
        };
    }

    readonly() {
        this._allow.r = true;
        this._allow.w = false;
        return this;
    }
    writeonly() {
        this._allow.r = false;
        this._allow.w = true;
        return this;
    }
    internal() {
        this._internal = true;
        return this;
    }
    allow({ r = false, w = false }) {
        this._allow.r = r;
        this._allow.w = w;
        return this;
    }

    valueOf() {
        if (!this._allow.r) {
            throw new IllegalAccessError(`${this.name} is not readable`);
        }
        return this._value;
    }
    value(newValue) {
        if (!this._allow.w) {
            throw new IllegalAccessError(`${this.name} is not writeable`);
        }
        if (this.typecheck(newValue)) {
            this._value = newValue;
            return newValue;
        } else {
            const t = this.typename();
            throw new TypeError(
                `Cannot assign ${this.name}: expected ${t}, got ${typename(newValue) || String(newValue)}`
            );
        }
    }
    typecheck(newValue) {
        abstract('PtlProperty::typecheck');
    }
}
PtlProperty.raiseInternal = function (name) {
    throw new ReferenceError(`Variable ${name} does not exist`);
};

module.exports = PtlProperty;
