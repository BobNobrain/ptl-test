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
        this._volatile = false;
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
    volatile() {
        if (this._internal) throw new TypeError(`Internal variable ${this} should not be marked as volatile`);
        this._volatile = true;
        return this;
    }
    internal() {
        if (this._volatile) throw new TypeError(`Volatile variable ${this} should not be marked as internal`);
        return super.internal();
    }

    checkChanges() {
        const changed = super.checkChanges();
        // Hide changes if PtlProperty decides that they are private.
        // They are hidden if _changed is true, but PtlProperty still
        // returns false:
        if (this._changed && !changed) return false;
        // Else, mark this variable changed either if it's volatile
        // or really was changed.
        return this._volatile || changed;
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
