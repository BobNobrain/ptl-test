const typeToClass = {};

function deserializeSchema(layerName, schemaData, client) {
    const schema = {};

    for (let propertyName in schemaData) {
        const propertyData = schemaData[propertyName];
        const type = propertyData._type;
        const PropertyClass = typeToClass[type];
        if (!PropertyClass) {
            throw new TypeError(`Unknown property type "${type}"`);
        }
        const property = new PropertyClass(layerName, propertyData, client);
        schema[propertyName] = property;
    }

    return schema;
}

function registerPtlRemoteClass(type, Class) {
    typeToClass[type] = Class;
}

module.exports = {
    deserializeSchema,
    registerPtlRemoteClass
};
