const PtlClient = require('./client/PtlClient');

module.exports = {
    client(...args) {
        return new PtlClient(...args);
    }
};
