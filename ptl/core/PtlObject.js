const PtlVariable = require('./PtlVariable');


/**
 * @class Represents a nested variable
 * @property {Object} schema Object schema
 */
class PtlObject extends PtlVariable {
    /**
     * Creates a new object variable
     * @param {Object} schema Defines object content schema
     */
    constructor(schema) {
        super({}, Object);

        this.schema = schema;

        for (let propertyName in schema) {
            schema[propertyName].name = propertyName;
        }
    }

    /**
     * Defines this variable as property on target object dest
     * @param {Object} dest Target object
     */
    plain(dest) {
        const obj = {};
        for (let propertyName in this.schema) {
            this.schema[propertyName].plain(obj);
        }
        Object.defineProperty(dest, this.name, {
            enumerable: true,
            writable: false,
            value: obj
        });
    }

    /**
     * Serializes property for Projectile sync operation
     * @return {Object} Serialized method data
     */
    sync() {
        const schema = {};
        for (let propertyName in this.schema) {
            schema[propertyName] = this.schema[propertyName].sync();
        }
        return Object.assign(super.sync(), {
            schema,
            _type: 'object'
        });
    }


    /**
     * Starts watching property changes
     */
    startWatch() {
        super.startWatch();
        for (let propertyName in this.schema) {
            this.schema[propertyName].startWatch();
        }
    }

    /**
     * Checks whether property value was changed since watch was started
     * @return {Boolean} Was property value changed
     */
    checkChanges() {
        const changed = super.checkChanges();
        if (changed) return changed;
        // Why so? Because if super desides that there were no changes, but
        // _changed flag is set, then these changes are private.
        if (this._changed) return false;

        // If nothing changed in ref to this object, check children
        for (let propertyName in this.schema) {
            if (this.schema[propertyName].checkChanges()) return true;
        }
        return false;
    }

    /**
     * Ends watching property changes
     */
    endWatch() {
        super.endWatch();
        for (let propertyName in this.schema) {
            this.schema[propertyName].endWatch();
        }
    }


    /**
     * Checks types compatibility (including inner properties)
     * @param  {any}     newValue Value to be checked
     * @return {Boolean}          Whether newValue can be assigned to this property
     */
    typecheck(newValue) {
        if (Object.keys(newValue).length !== Object.keys(this.schema).length) return false;
        for (let propertyName in newValue) {
            const property = this.schema[propertyName];
            if (!property) return false;
            if (!property.typecheck(newValue[propertyName])) return false;
        }
        return true;
    }


    /**
     * Returns value of the property
     * @return {any} Property value
     * @throws {IllegalAccessError} If property is not readable
     */
    valueOf() {
        // check all permissions
        super.valueOf();
        const result = {};
        for (let propertyName in this.schema) {
            result[propertyName] = this.schema[propertyName].valueOf();
        }
        return result;
    }

    /**
     * Sets new value for property
     * @param  {any} newValue The value to be set
     * @return {any}          Returns the value back
     * @throws {IllegalAccessError} If property is not writable
     * @throws {TypeError} If value is of incorrect type
     */
    value(newValue) {
        super.value(newValue);
        this._value = {};
        for (let propertyName in this.schema) {
            this.schema[propertyName].value(newValue[propertyName]);
        }
    }
}

module.exports = PtlObject;
