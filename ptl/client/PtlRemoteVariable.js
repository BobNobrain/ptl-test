const PtlVariable = require('../core/PtlVariable');
const { IllegalAccessError } = require('../util/errors');

/**
 * @class Represents remote layer variable
 * @property {String}    layerName  Name of host layer
 * @property {PtlClient} client     Client instance
 * @property {String}    parentName Array of parent objects names, used for nested objects
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
        this.parentName = [];
        this._nullable = syncData._nullable;
        this._allow = syncData._allow;
        this.layerName = layerName;
        this.client = client;
    }


    makeGetSetSync() {
        const sync = () => {
            return this.client.getPropertyValue(this.layerName + '/' + this.fullName())
                .then(value => {
                    this._value = value;
                    return value;
                });
        };
        let get;
        if (this._allow.r) {
            get = () => this._value;
        } else {
            get = () => { throw new IllegalAccessError(`Property ${this.fullName()} is not readable`); };
        }

        let set;
        if (this._allow.w) {
            set = value => {
                if (!this.typecheck(value)) {
                    return Promise.reject(
                        new TypeError(`Attempting to set ${this} with value "${value}" of incorrect type`)
                    );
                }
                return this.client.setPropertyValue(this.layerName + '/' + this.fullName(), value)
                    .then(remoteValue => {
                        console.log(remoteValue);
                        this._value = remoteValue;
                    });
            };
        } else {
            set = () => Promise.reject(new IllegalAccessError(`Property "${this.fullName()}" is not writable`));
        }

        return { get, set, sync };
    }

    /**
     * Define this variable on dest. See examples on how it behaves
     * @param  {Object} dest Target object
     * @example
     * const name = plained.name(); // get value from cache
     * const x = plained.point.x(); // for nested objects
     * @example
     * // you probably will use such constructions with
     * // PtlClient request buffering:
     * plained.name = 'John'; // will asyncly set value
     * plained.point.x = 68;
     * @example
     * // use this without buffering if you need a
     * // Promise of operation result
     * plained.x.set(68);
     * // sync variable value with remote layer
     * plained.x.sync();
     */
    plain(dest) {
        const { get, set, sync } = this.makeGetSetSync();

        get.get = get;
        get.set = set;
        get.sync = sync;

        Object.defineProperty(dest, this.name, {
            enumerable: true,
            get: () => get,
            set
            // writable: false,
            // value: {
            //     sync,
            //     get,
            //     set,
            //     valueOf: get
            // }
        });
    }

    /**
     * Apply patch value to this variable
     * @param  {any} patch Value to patch this with
     */
    applyPatch(patch) {
        this._value = patch;
    }


    fullName() {
        return this.parentName.concat([this.name]).join('.');
    }
}

module.exports = PtlRemoteVariable;
