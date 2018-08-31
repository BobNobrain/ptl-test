const PtlLayer = require('./core/PtlLayer');
const PtlServer = require('./remote/PtlServer');

module.exports = {
    layer(...args) {
        return new PtlLayer(...args);
    },
    httpServer(...args) {
        return new PtlServer(...args);
    }
};
