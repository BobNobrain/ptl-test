const PtlLayer = require('./core/PtlLayer');
const PtlServer = require('./server/PtlServer');
const PtlVariable = require('./core/PtlVariable');
const PtlMethod = require('./core/PtlMethod');
const { PtlError } = require('./util/errors');

module.exports = {
    layer(...args) {
        return new PtlLayer(...args);
    },
    httpServer(...args) {
        return new PtlServer(...args);
    },

    method(body) {
        return new PtlMethod(body, false);
    },
    arrow(body) {
        return new PtlMethod(body, true);
    },

    number(value = 0) {
        return new PtlVariable(value, Number);
    },
    string(value = '') {
        return new PtlVariable(value, String);
    },
    bool(value = false) {
        return new PtlVariable(value, Boolean);
    },
    hash(value = {}) {
        return new PtlVariable(value, Object);
    },

    // contextual: (layerContent, method, args, context) => method(layerContent, context, ...args),

    raise(message, code) {
        throw new PtlError(message, code);
    },
    reject(message, code) {
        return Promise.reject(new PtlError(message, code));
    }
};
