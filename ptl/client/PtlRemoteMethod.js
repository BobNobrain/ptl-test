const PtlMethod = require('../core/PtlMethod');

/**
 * @class Represents remote layer method
 */
class PtlRemoteMethod extends PtlMethod {
    /**
     * Creates remote method instance from Projectile sync data
     * @param  {String}    layerName Layer name
     * @param  {Object}    syncData  Sync operation result
     * @param  {PtlClient} client    Client instance
     */
    constructor(layerName, syncData, client) {
        const name = syncData.name;
        super(
            (...args) => client.call(layerName + '/' + name, args),
            syncData.isArrow
        );
        // this.client = client;
        this.name = name;
        // this.layerName = layerName;
    }

    /**
     * Define this method on dest object
     * @param  {Object} dest Target object
     */
    plain(dest) {
        Object.defineProperty(dest, this.name, {
            enumerable: true,
            writable: false,
            value: this._value
        });
    }
}

module.exports = PtlRemoteMethod;
