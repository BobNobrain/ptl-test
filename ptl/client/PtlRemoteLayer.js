const PtlLayer = require('../core/PtlLayer');
const PtlRemoteVariable = require('./PtlRemoteVariable');
const PtlRemoteMethod = require('./PtlRemoteMethod');

/**
 * @class Represents remote layer
 * @property {PtlClient} client Client instance to access Projectile server
 */
class PtlRemoteLayer extends PtlLayer {
    /**
     * Creates new remote layer from sync operation result
     * @param  {Object}    remoteLayerSyncResult Result of projectile sync operation
     * @param  {PtlClient} client                Client instance
     */
    constructor(remoteLayerSyncResult, client) {
        const { name, schema } = remoteLayerSyncResult;
        // const layerDescription = ;
        super(name, makeDescription(name, schema, client));
        this.client = client;
    }

    /**
     * Applies changed variables patch to the layer
     * @param  {Object} patch Patch content
     * @throws {ReferenceError} If contains unknown property names
     * @throws {TypeError} If this patch contains value for not a variable
     */
    applyPatch(patch) {
        for (let propertyName in patch) {
            const property = this.schema[propertyName];
            if (!property) {
                throw new ReferenceError(`Cannot apply patch for ${this}: unknown property "${propertyName}"`);
            }
            if (property instanceof PtlRemoteVariable) {
                property.applyPatch(patch[propertyName]);
            } else {
                throw new TypeError(
                    `Cannot apply patch for ${property}: patches can only be applied to remote variables`
                );
            }
        }
    }

    toString() {
        return `[PtlRemoteLayer "${this.name}"]`;
    }
}

function makeDescription(layerName, schema, client) {
    const result = {};
    for (let propertyName in schema) {
        const propertyDescriptor = schema[propertyName];
        if (propertyDescriptor._type === 'variable') {
            // result[propertyName] = PtlVariable.fromSyncData(layerName, propertyDescriptor, client);
            result[propertyName] = new PtlRemoteVariable(layerName, propertyDescriptor, client);
        } else if (propertyDescriptor._type === 'method') {
            // result[propertyName] = PtlMethod.fromSyncData(layerName, propertyDescriptor, client);
            result[propertyName] = new PtlRemoteMethod(layerName, propertyDescriptor, client);
        } else {
            throw new TypeError(`Unknown property descriptor type "${propertyDescriptor._type}"`);
        }
    }
    return result;
}

module.exports = PtlRemoteLayer;
