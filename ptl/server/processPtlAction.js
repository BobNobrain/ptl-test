const { PtlError } = require('../util/errors');

const allowedActions = ['call', 'get', 'set', 'sync'];

module.exports = function processPtlAction(
    { name, args = [], action = 'call' },
    exposedLayers,
    context,
    watchedLayers
) {
    if (!allowedActions.includes(action)) {
        return Promise.reject(new PtlError(`Unknown action "${action}"`, 400));
    }

    const [layerName, propertyName] = name.split('/');

    const layer = exposedLayers[layerName];
    if (!layer && layerName !== '*') {
        return Promise.reject(new PtlError(`Cannot find layer "${layerName}"`, 404));
    }

    if (action === 'sync') {
        if (propertyName) {
            return Promise.reject(
                new PtlError(`Action "sync" can be applied to layers only, but "${name}" is not a layer`, 400)
            );
        }

        // sync all layers
        if (layerName === '*') {
            return Promise.resolve(
                Object.keys(exposedLayers).map(
                    layerName => exposedLayers[layerName].sync()
                )
            );
        }

        return Promise.resolve(layer.sync());
    }

    if (!layer) return Promise.reject(new PtlError(`Layer name "*" can be used only to sync all layers`));

    if (action === 'call') {
        layer.startWatch();
        watchedLayers[layerName] = true;
        return layer.call(context, propertyName.split('.'), args);
    }

    const property = layer.getProperty(propertyName.split('.'));
    if (action === 'get') {
        return property.valueOf();
    }

    if (action === 'set') {
        return Promise.resolve(property.value(...args)).then(() => property.valueOf());
    }

    return Promise.reject(new PtlError(`Ptl action "${action}" is not implemented`, 500));
};
