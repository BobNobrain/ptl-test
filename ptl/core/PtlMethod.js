const PtlProperty = require('./PtlProperty');

class PtlMethod extends PtlProperty {
    constructor(value, isArrow) {
        super(value);
        this.isArrow = isArrow;
        this.isContextual = false;
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

module.exports = PtlMethod;
