const PtlVariable = require('../core/PtlVariable');
const { IllegalAccessError } = require('../util/errors');

/**
 * @class Represents remote layer variable
 * @property {String} layerName Name of host layer
 * @property {PtlClient} client Client instance
 */
class PtlRemoteVariable extends PtlVariable {
    /**
     * Creates remote variable instance from Projectile sync result
     * @param  {String}    layerName Name of host layer
     * @param  {Object}    syncData  Sync operation result
     * @param  {PtlClient} client    Client instance
     * @throws {ReferenceError} If syncData.T does not reference known type constructor
     */
    constructor(layerName, syncData, client) {
        const T = client.typesRegistry[syncData.T];
        if (!T) {
            throw new ReferenceError(
                `Unknown type for variable ${syncData.name}: "${syncData.T}". Did you register it with PtlClient::registerType?`
            );
        }
        super(syncData._value, T);
        this.name = syncData.name;
        this._nullable = syncData._nullable;
        this._allow = syncData._allow;
        this.layerName = layerName;
        this.client = client;
    }

    /**
     * Define this variable on dest. It will be an object having get, sync and set methods
     * @param  {Object} dest Target object
     */
    plain(dest) {
        const sync = () => {
            return this.client.getPropertyValue(this.layerName + '/' + this.name)
                .then(value => {
                    this._value = value;
                });
        };
        let get;
        if (this._allow.r) {
            get = () => this._value;
        } else {
            get = () => { throw new IllegalAccessError(`Property ${this.name} is not readable`); };
        }

        let set;
        if (this._allow.w) {
            set = value => {
                return this.client.setPropertyValue(this.layerName + '/' + this.name)
                    .then(remoteValue => {
                        this._value = remoteValue;
                    });
            };
        } else {
            set = () => Promise.reject(new IllegalAccessError(`Property ${this.name} is not writable`));
        }

        Object.defineProperty(dest, this.name, {
            enumerable: true,
            writable: false,
            value: {
                sync,
                get,
                set,
                valueOf: get
            }
        });
    }

    /**
     * Apply patch value to this variable
     * @param  {any} patch Value to patch this with
     */
    applyPatch(patch) {
        this._value = patch;
    }
}

module.exports = PtlRemoteVariable;
