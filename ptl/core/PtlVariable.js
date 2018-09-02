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

    plain(dest) {
        Object.defineProperty(dest, this.name, {
            enumerable: true,
            get: () => this._value,
            set: value => {
                this._value = value;
                this._changed = true;
            }
        });
    }

    sync() {
        return Object.assign({}, this, {
            T: this.T.name,
            _type: 'variable'
        });
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

PtlVariable.typesRegistry = {
    Number,
    String,
    Boolean,
    Object
};
PtlVariable.registerType = function (name, T) {
    PtlVariable.typesRegistry[name] = T;
};

PtlVariable.fromSyncData = function (layerName, syncData, client) {
    const T = PtlVariable.typesRegistry[syncData.T];
    if (!T) {
        throw new ReferenceError(
            `Unknown variable type: ${syncData.T}. Did you register it with PtlVariable.registerType?`
        );
    }
    const result = new PtlVariable(syncData._value, T);
    result._nullable = syncData._nullable;
    result._allow = syncData._allow;
    result.name = syncData.name;
    return result;
};

module.exports = PtlVariable;
