const PtlVariable = require('../core/PtlVariable');
const { IllegalAccessError } = require('../util/errors');

class PtlRemoteVariable extends PtlVariable {
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
            set = () => { throw new IllegalAccessError(`Property ${this.name} is not writable`); };
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
}

module.exports = PtlRemoteVariable;
