const PtlRemoteVariable = require('./PtlRemoteVariable');
const { deserializeSchema } = require('./deserializeSchema');


/**
 * @class Represents remote object
 * @see PtlObject
 */
class PtlRemoteObject extends PtlRemoteVariable {
    /**
     * Creates remote object instance from Projectile sync result
     * @param  {String}    layerName Name of host layer
     * @param  {Object}    syncData  Sync operation result
     * @param  {PtlClient} client    Client instance
     * @throws {TypeError} If syncData has info about inner properties of unknown type
     */
    constructor(layerName, syncData, client) {
        super(layerName, syncData, client);

        const schemaData = syncData.schema;
        const schema = deserializeSchema(layerName, schemaData, client);

        for (let propertyName in schema) {
            schema[propertyName].parentName = this.parentName.concat([syncData.name]);
        }

        this.schema = schema;

        // for closure
        const name = syncData.name;

        Object.defineProperty(this, '_value', {
            enumerable: true,
            get() {
                const result = {};
                for (let propertyName in schema) {
                    const property = schema[propertyName];
                    result[propertyName] = property._value;
                }
                return result;
            },
            set(value) {
                for (let propertyName in schema) {
                    if (value[propertyName] === void 0)
                        throw new TypeError(`Cannot set value for ${name}: new value lacks ${propertyName} property`);

                    const property = schema[propertyName];
                    property._value = value[propertyName];
                }
            }
        });
    }

    /**
     * Define this object on dest. It can be used as regular object or called
     * to get object with get, set, sync methods like in PtlRemoteVariable
     * @param  {Object} dest Target object
     * @see PtlRemoteVariable::plain
     * @example
     * // to get properties
     * ptlRemoteLayer.plain().point.x()
     * @example
     * // to set (or sync) whole object
     * ptlRemoteLayer.plain().point().sync();
     * ptlRemoteLayer.plain().point().set({ x: 0, y: 0 });
     * ptlRemoteLayer.plain().point = { x: 1, y: 2 };
     */
    plain(dest) {
        const getSetSync = this.makeGetSetSync();

        const funcWithProps = () => getSetSync;

        for (let propertyName in this.schema) {
            const property = this.schema[propertyName];
            property.plain(funcWithProps);
        }

        Object.defineProperty(dest, this.name, {
            enumerable: true,
            get: () => funcWithProps,
            set: getSetSync.set
        });
    }
}


module.exports = PtlRemoteObject;
