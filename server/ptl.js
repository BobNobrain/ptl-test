const ptl = require('../ptl');

const commonLayer = ptl.layer('test', () => ({
    test: {
        counter: 42
    },

    increment() {
        this.counter++;
        return this.counter;
    },

    echo(...strings) {
        const result = strings.join(' ');
        console.log();
        return Promise.resolve(result);
    }
}));

const contextLayer = ptl.layer('context', () => ({
    token: null
}));

const server = ptl.httpServer('/ptl');
server.addLayer(commonLayer);
server.setContextLayer(contextLayer);
server.initLayers();

module.exports = server;
