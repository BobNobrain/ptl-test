const PtlMethod = require('../core/PtlMethod');

class PtlRemoteMethod extends PtlMethod {
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

    plain(dest) {
        Object.defineProperty(dest, this.name, {
            enumerable: true,
            writable: false,
            value: this._value
        });
    }
}

module.exports = PtlRemoteMethod;
