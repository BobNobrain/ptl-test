const PtlProperty = require('./PtlProperty');

const primitiveTypes = {
    string: String,
    number: Number,
    boolean: Boolean
};

class PtlVariable extends PtlProperty {
    constructor(value, type) {
        super(value);
        this.T = type;
        this._nullable = value === null;
        this._allow.w = true;
    }

    nullable() {
        this._nullable = true;
        return this;
    }

    typename() {
        return this.T.constructor.name;
    }

    typecheck(value) {
        if (value === void 0) return false;
        if (value === null) return this._nullable;
        if (this.T === primitiveTypes[typeof value]) return true;
        return value instanceof this.T;
    }
}

module.exports = PtlVariable;
