const PtlClient = require('./client/PtlClient');

module.exports = {
    /**
     * Creates new client instance
     * @param  {Object}    options PtlClient constructor options
     * @return {PtlClient}         New PtlClient instance
     * @see PtlClient::constructor
     */
    client(options) {
        return new PtlClient(options);
    }
};
