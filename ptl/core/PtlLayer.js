const PtlMethod = require('./PtlMethod');

/**
 * @class Projectile layer
 * @property {String} name Layer name
 * @property {Object} schema Layer property descriptions hashed by name
 */
class PtlLayer {
    /**
     * Creates a new layer
     * @param  {String} name        Layer name
     * @param  {Object} description Layer properties description
     */
    constructor(name, description) {
        this.name = name;
        this.schema = description;

        for (let propertyName in description) {
            description[propertyName].name = propertyName;
        }

        let plainRef = null;
        this.plain = function () {
            if (plainRef === null) {
                plainRef = {};
                for (let propertyName in this.schema) {
                    const property = this.schema[propertyName];
                    property.plain(plainRef);
                }
            }
            return plainRef;
        };
    }

    /**
     * Finds a property on the layer
     * @param  {Array<String>} path Embedded property names
     * @return {PtlProperty}        Found property
     * @throws {ReferenceError} If property cannot be found
     */
    getProperty(path) {
        let _path = path.slice();
        let property = this;
        while (_path.length) {
            property = property.schema[_path.shift()];
            if (!property) {
                throw new ReferenceError(`Path "${path.join}" does not exist on ${this}`);
            }
        }
        return property;
    }

    /**
     * Calls layer method
     * @param  {Object}        context Projectile context with data property and send method
     * @param  {Array<String>} path    Method path
     * @param  {Array}         args    Arguments to call method with
     * @return {Promise}               Promise of method call result
     * @throws {ReferenceError} If method cannot be found
     */
    call(context, path, args) {
        const property = this.getProperty(path);
        if (property instanceof PtlMethod) {
            return property.call(this.plain(), args, context);
        } else {
            return Promise.reject(new TypeError(`Cannot call "${path.join('.')}": not a function`));
        }
    }

    /**
     * Serializes layer for Projectile sync operation
     * @return {Object} Serialized layer sync data
     */
    sync() {
        const result = {};
        for (let propertyName in this.schema) {
            const property = this.schema[propertyName];
            if (property._internal) continue;
            result[propertyName] = property.sync();
        }
        return {
            name: this.name,
            schema: result
        };
    }


    /**
     * Enables watching mode for layer. Any changed variables will be marked.
     */
    startWatch() {
        for (let propertyName in this.schema) {
            this.schema[propertyName].startWatch();
        }
    }
    /**
     * Gets all layer properties changed since watch starting
     * @return {Object} Layer patch consisting of changed property values
     */
    checkChanges() {
        const patch = {};
        for (let propertyName in this.schema) {
            const property = this.schema[propertyName];
            if (property.checkChanges()) {
                patch[propertyName] = property._value;
            }
        }
        return patch;
    }
    /**
     * Disables watching mode for layer
     */
    endWatch() {
        for (let propertyName in this.schema) {
            this.schema[propertyName].endWatch();
        }
    }


    getName() {
        return this.name;
    }
    toString() {
        return `[PtlLayer "${this.name}"]`;
    }
}

module.exports = PtlLayer;
