const PtlLayer = require('../core/PtlLayer');
const PtlRemoteVariable = require('./PtlRemoteVariable');
const PtlRemoteMethod = require('./PtlRemoteMethod');

class PtlRemoteLayer extends PtlLayer {
    constructor(remoteLayerSyncResult, client) {
        const { name, schema } = remoteLayerSyncResult;
        // const layerDescription = ;
        super(name, makeDescription(name, schema, client));
        this.client = client;
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
