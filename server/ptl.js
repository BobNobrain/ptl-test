const ptl = require('../ptl');

const commonLayer = ptl.layer('guest', () => ({
    echo(...strings) {
        const result = strings.join(' ');
        console.log(result);
        return Promise.resolve(result);
    }
}));

const protectedLayer = ptl.layer('protected', () => ({
    test: {
        counter: 42
    },

    increment() {
        this.test.counter++;
        return this.test.counter;
    }
}));

const contextLayer = ptl.layer('context', () => ({
    token: null,

    onRequest(exposedLayers) {
        const token = this.token;
        if (token !== 'abc') {
            exposedLayers.protected = false;
        }
        return Promise.resolve(exposedLayers);
    }
}));

const server = ptl.httpServer('/ptl');
server.addLayer(commonLayer);
server.addLayer(protectedLayer);
server.setContextLayer(contextLayer);
server.initLayers();

module.exports = server;
