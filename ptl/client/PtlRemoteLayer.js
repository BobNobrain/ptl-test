const PtlLayer = require('../core/PtlLayer');
const PtlRemoteVariable = require('./PtlRemoteVariable');
const PtlRemoteMethod = require('./PtlRemoteMethod');
const PtlRemoteObject = require('./PtlRemoteObject');
const { deserializeSchema, registerPtlRemoteClass } = require('./deserializeSchema');

registerPtlRemoteClass('variable', PtlRemoteVariable);
registerPtlRemoteClass('method', PtlRemoteMethod);
registerPtlRemoteClass('object', PtlRemoteObject);

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
        super(name, deserializeSchema(name, schema, client));
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
            property.applyPatch(patch[propertyName]);
        }
    }

    toString() {
        return `[PtlRemoteLayer "${this.name}"]`;
    }
}


module.exports = PtlRemoteLayer;
