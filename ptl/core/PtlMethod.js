const PtlProperty = require('./PtlProperty');

class PtlMethod extends PtlProperty {
    constructor(value, isArrow) {
        super(value);
        this.isArrow = isArrow;
        this.isContextual = false;
    }

    plain(dest) {
        Object.defineProperty(dest, this.name, {
            enumerable: true,
            value: this._value,
            writable: false
        });
    }

    sync() {
        return Object.assign({
            _type: 'method'
        }, this);
    }

    typecheck(newValue) {
        return newValue instanceof Function;
    }

    call(layerContent, args, context) {
        try {
            if (this.isContextual) args = [context].concat(args);
            if (this.isArrow) {
                return Promise.resolve(this.valueOf()(layerContent, ...args));
            } else {
                return Promise.resolve(this.valueOf().apply(layerContent, args));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    wrap(wrapper) {
        const method = this._value;
        this.isArrow = true;
        this._value = (layerContent, ...args) => wrapper(layerContent, method, args);
        return this;
    }
    contextual() {
        this.isContextual = true;
        return this;
    }
}

PtlMethod.fromSyncData = function (layerName, syncData, client) {
    const result = new PtlMethod((...args) => {
        return client.call(layerName + '/' + syncData.name, args);
    });
    result.isArrow = syncData.isArrow;
    result.isContextual = syncData.isContextual;
    result.name = syncData.name;
    result._allow = syncData._allow;
    return result;
};

module.exports = PtlMethod;
