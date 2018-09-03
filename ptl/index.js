const PtlLayer = require('./core/PtlLayer');
const PtlServer = require('./server/PtlServer');
const PtlVariable = require('./core/PtlVariable');
const PtlMethod = require('./core/PtlMethod');
const PtlObject = require('./core/PtlObject');
const errors = require('./util/errors');

const { PtlError } = errors;

module.exports = {
    // classes
    PtlLayer,
    PtlServer,
    PtlVariable,
    PtlMethod,
    errors,

    /**
     * Creates new PtlLayer
     * @param  {...any}   args PtlLayer constructor arguments
     * @return {PtlLayer}      new PtlLayer instance
     * @see PtlLayer::constructor
     */
    layer(...args) {
        return new PtlLayer(...args);
    },

    /**
     * Creates new PtlServer
     * @param  {...any}    args PtlServer constructor arguments
     * @return {PtlServer}      new PtlServer instance
     * @see PtlServer::constructor
     */
    httpServer(...args) {
        return new PtlServer(...args);
    },

    /**
     * Creates new PtlMethod
     * @param  {Function}  body Method body
     * @return {PtlMethod}      new PtlMethod instance
     * @see PtlMethod::constructor
     */
    method(body) {
        return new PtlMethod(body, false);
    },
    /**
     * Creates new PtlMethod that will be treated as arrow function
     * @param  {Function}  body Method body
     * @return {PtlMethod}      new PtlMethod instance
     * @see PtlMethod::constructor
     */
    arrow(body) {
        return new PtlMethod(body, true);
    },

    /**
     * Creates new PtlVariable of type Number
     * @param  {Number}      value Initial variable value
     * @return {PtlVariable}       new PtlVariable instance
     * @see PtlVariable::constructor
     */
    number(value = 0) {
        return new PtlVariable(value, Number);
    },
    /**
     * Creates new PtlVariable of type String
     * @param  {String}      value Initial variable value
     * @return {PtlVariable}       new PtlVariable instance
     * @see PtlVariable::constructor
     */
    string(value = '') {
        return new PtlVariable(value, String);
    },
    /**
     * Creates new PtlVariable of type Boolean
     * @param  {Boolean}      value Initial variable value
     * @return {PtlVariable}        new PtlVariable instance
     * @see PtlVariable::constructor
     */
    bool(value = false) {
        return new PtlVariable(value, Boolean);
    },
    /**
     * Creates new PtlVariable of type Object
     * @param  {Object}      value Initial variable value
     * @return {PtlVariable}       new PtlVariable instance
     * @see PtlVariable::constructor
     */
    hash(value = {}) {
        return new PtlVariable(value, Object);
    },
    object(schema = errors.required('schema for PtlObject')) {
        return new PtlObject(schema);
    },

    /**
     * Throws PtlError
     * @param  {String} message Error message
     * @param  {Number} code    Error code
     * @see PtlError
     */
    raise(message, code) {
        throw new PtlError(message, code);
    },
    /**
     * Returns a promise rejected with PtlError
     * @param  {String} message Error message
     * @param  {Number} code    Error code
     * @return {Promise}        A rejected promise
     * @see PtlError
     */
    reject(message, code) {
        return Promise.reject(new PtlError(message, code));
    }
};
