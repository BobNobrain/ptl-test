const PtlProperty = require('./PtlProperty');

const primitiveTypes = {
    string: String,
    number: Number,
    boolean: Boolean
};

/**
 * @class Represents layer variable property
 * @property {Function} T Variable type constructor
 * @property {Boolean} _nullable Whether value can be null
 * @property {Boolean} _volatile Whether value can be changed from outside
 */
class PtlVariable extends PtlProperty {
    constructor(value, type) {
        super(value);
        this.T = type;
        this._nullable = value === null;
        this._allow.w = true;
        this._volatile = false;
    }

    /**
     * Defines this variable as property on target object dest
     * @param  {Object} dest Target object
     */
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

    /**
     * Serializes property for Projectile sync operation
     * @return {Object} Serialized method data
     */
    sync() {
        return Object.assign({}, this, {
            T: this.T.name,
            _type: 'variable'
        });
    }


    /**
     * Marks this variable as nullable
     * @return {PtlVariable} this
     * @chainable
     */
    nullable() {
        this._nullable = true;
        return this;
    }

    /**
     * Marks this variable as volatile
     * @return {PtlVariable} this
     * @chainable
     * @throws {TypeError} If this variable is already marked as internal
     */
    volatile() {
        if (this._internal) throw new TypeError(`Internal variable ${this} should not be marked as volatile`);
        this._volatile = true;
        return this;
    }

    /**
     * Marks this variable as internal so it is not synced
     * @return {PtlVariable} this
     * @chainable
     * @throws {TypeError} If this variable is already marked as volatile
     */
    internal() {
        if (this._volatile) throw new TypeError(`Volatile variable ${this} should not be marked as internal`);
        return super.internal();
    }


    /**
     * Checks whether property value was changed since watch was started
     * @return {Boolean} Was property value changed
     */
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


    /**
     * Gets this variable type name string
     * @return {String} Variable constructor function name
     */
    typename() {
        return this.T.name;
    }

    /**
     * Checks types compatibility
     * @param  {any}     newValue Value to be checked
     * @return {Boolean}          Whether newValue can be assigned to this variable
     */
    typecheck(value) {
        if (value === void 0) return false;
        if (value === null) return this._nullable;
        if (this.T === primitiveTypes[typeof value]) return true;
        return value instanceof this.T;
    }
}

// PtlVariable.fromSyncData = function (layerName, syncData, client) {
//     const T = PtlVariable.typesRegistry[syncData.T];
//     if (!T) {
//         throw new ReferenceError(
//             `Unknown variable type: ${syncData.T}. Did you register it with PtlVariable.registerType?`
//         );
//     }
//     const result = new PtlVariable(syncData._value, T);
//     result._nullable = syncData._nullable;
//     result._allow = syncData._allow;
//     result.name = syncData.name;
//     return result;
// };

module.exports = PtlVariable;
