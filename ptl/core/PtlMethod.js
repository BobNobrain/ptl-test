const PtlProperty = require('./PtlProperty');

/**
 * @class Represents layer method
 * @property {Boolean} isArrow Whether method body should be called as arrow function
 * @property {Boolean} isContextual Should request context be passed as first argument
 */
class PtlMethod extends PtlProperty {
    /**
     * Creates new layer method
     * @param  {Function}  value   Method body
     * @param  {Boolean} isArrow Whether method body should be called as arrow function
     */
    constructor(value, isArrow) {
        super(value);
        this.isArrow = isArrow;
        this.isContextual = false;
    }

    /**
     * Define this method on dest object
     * @param  {Object} dest Target object
     */
    plain(dest) {
        Object.defineProperty(dest, this.name, {
            enumerable: true,
            value: this._value,
            writable: false
        });
    }

    /**
     * Serializes method for Projectile sync operation
     * @return {Object} Serialized method data
     */
    sync() {
        return Object.assign({
            _type: 'method'
        }, this);
    }

    /**
     * Checks types compatibility
     * @param  {any}     newValue Value to be checked
     * @return {Boolean}          Whether newValue can be assigned to this property
     */
    typecheck(newValue) {
        return newValue instanceof Function;
    }

    typename() {
        return 'Function';
    }


    /**
     * Calls this method with args and context
     * @param  {Object}  layerContent Result of PtlLayer::plain, will be used as this in method body
     * @param  {Array}   args         Array of arguments to call method with
     * @param  {Object}  context      Projectile server context
     * @return {Promise}              Promise of method call result
     */
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


    /**
     * Wraps method body with a decorator
     * @param  {Function}  wrapper Decorator, called with (layerContent, method, args)
     * @return {PtlMethod}         this
     * @chainable
     */
    wrap(wrapper) {
        const method = this._value;
        this.isArrow = true;
        this._value = (layerContent, ...args) => wrapper(layerContent, method, args);
        return this;
    }
    /**
     * Defines this method as contextual. Method body will be called with server context as first argument
     * @return {PtlMethod} this
     * @chainable
     */
    contextual() {
        this.isContextual = true;
        return this;
    }
}

// PtlMethod.fromSyncData = function (layerName, syncData, client) {
//     const result = new PtlMethod((...args) => {
//         return client.call(layerName + '/' + syncData.name, args);
//     });
//     result.isArrow = syncData.isArrow;
//     result.isContextual = syncData.isContextual;
//     result.name = syncData.name;
//     result._allow = syncData._allow;
//     return result;
// };

module.exports = PtlMethod;
