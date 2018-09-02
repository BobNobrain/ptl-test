const { typename } = require('../util');
const { IllegalAccessError, abstract } = require('../util/errors');

/**
 * @class Represents generic layer property
 * @property {String}  name Property name
 * @property {any}     _value Property value
 * @property {Boolean} _internal Should this property be visible to client
 * @property {Boolean} _allow.r Is this property readable
 * @property {Boolean} _allow.w Is this property writable
 */
class PtlProperty {
    /**
     * Creates a property
     * @param  {any} value Initial property value
     */
    constructor(value) {
        this.name = null;
        this._value = value;
        this._internal = false;
        this._allow = {
            r: true,
            w: false
        };

        this._changed = false;
        this._watching = false;
    }

    /**
     * Defines this property on target object dest. Abstract.
     * @param  {Object} dest Target object
     */
    plain(dest) {
        abstract('PtlProperty::plain');
    }

    /**
     * Serializes property for Projectile sync operation
     * @return {Object} Serialized method data
     */
    sync() {
        return Object.assign({}, this);
    }


    /**
     * Marks this property as readonly
     * @return {PtlProperty} this
     * @chainable
     */
    readonly() {
        this._allow.r = true;
        this._allow.w = false;
        return this;
    }

    /**
     * Marks this property as writeonly
     * @return {PtlProperty} this
     * @chainable
     */
    writeonly() {
        this._allow.r = false;
        this._allow.w = true;
        return this;
    }

    /**
     * Marks this property as internal
     * @return {PtlProperty} this
     * @chainable
     */
    internal() {
        this._internal = true;
        return this;
    }

    /**
     * Sets allowed operations for property
     * @param  {Boolean} options.r Is property readable
     * @param  {Boolean} options.w Is property writable
     * @return {PtlProperty} this
     * @chainable
     */
    allow({ r = false, w = false }) {
        this._allow.r = r;
        this._allow.w = w;
        return this;
    }


    /**
     * Returns value of the property
     * @return {any} Property value
     * @throws {IllegalAccessError} If property is not readable
     */
    valueOf() {
        if (!this._allow.r) {
            throw new IllegalAccessError(`${this.name} is not readable`);
        }
        return this._value;
    }

    /**
     * Sets new value for property
     * @param  {any} newValue The value to be set
     * @return {any}          Returns the value back
     * @throws {IllegalAccessError} If property is not writable
     * @throws {TypeError} If value is of incorrect type
     */
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


    /**
     * Checks types compatibility
     * @param  {any}     newValue Value to be checked
     * @return {Boolean}          Whether newValue can be assigned to this property
     */
    typecheck(newValue) {
        abstract('PtlProperty::typecheck');
    }


    /**
     * Starts watching property changes
     */
    startWatch() {
        if (!this._watching) {
            this._changed = false;
            this._watching = true;
        }
    }

    /**
     * Checks whether property value was changed since watch was started
     * @return {Boolean} Was property value changed
     */
    checkChanges() {
        if (this._internal || !this._allow.r) return false;
        return this._changed;
    }

    /**
     * Ends watching property changes
     */
    endWatch() {
        this._watching = false;
    }


    toString() {
        return `[PtlProperty "${this.name}"]`;
    }
}

/**
 * Throws an error when an internal variable is accessed
 * @param  {String} name Variable name
 * @static
 */
PtlProperty.raiseInternal = function (name) {
    throw new ReferenceError(`Variable ${name} does not exist`);
};

module.exports = PtlProperty;
