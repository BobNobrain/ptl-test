const PtlRemoteLayer = require('./PtlRemoteLayer');
const { PtlError } = require('../util/errors');

class PtlClientRequestError extends PtlError {
    constructor(error) {
        super(error.message, error.code);
        this.error = error;
    }
}

/**
 * PtlClient
 * @class Projectile client
 * @property {String} url Projectile server url
 * @property {[String]: Function} typesRegistry User types registry for syncronizing custom types
 * @property {(String, Object): Promise<Object>} post Http request provider
 * @property {Object} hooks Hash of hooks listeners arrays
 */
class PtlClient {
    /**
     * Creates new client instance
     * @param  {String}   options.url    Projectile server url
     * @param  {Function} options.post   Http post request provider
     */
    constructor({ url, post }) {
        this.url = url;
        this.post = post;

        this.layers = {};
        this.context = {};
        this.version = '0.0.1';

        this.typesRegistry = { String, Number, Boolean, Object };

        this.buffer = [];
        this.buffering = false;
        this.bufferingPromise = Promise.resolve(void 0);

        this.hooks = {
            // TODO: more hooks
            afterResponseProcessed: [],
            onResponseError: []
        };
    }

    /**
     * Runs all callbacks for specified hook
     * @param {String} hookName Name of the hook to trigger
     * @param {Array} args Arguments to pass into hook callbacks
     * @returns {Promise} A Promise of when all hooks will be run
     * @throws {ReferenceError} If hookName does not name an existing hook
     */
    triggerHook(hookName, args) {
        const hooks = this.hooks[hookName];
        if (!hooks) {
            throw new ReferenceError(`Unknown hook "${hookName}"`);
        }
        let queue = Promise.resolve(void 0);
        for (let i = 0; i < hooks.length; i++) {
            const ret = hooks[i](...args);
            if (ret instanceof Promise) {
                queue = queue.then(() => ret);
            }
        }
        return queue;
    }

    /**
     * Adds a hook listener for the client
     * @param {String} hookName Name of the hook to listen
     * @param {Function} listener The listener to be called when hook happens
     * @throws {ReferenceError} If hookName does not name an existing hook
     */
    addHookListener(hookName, listener) {
        const hooks = this.hooks[hookName];
        if (!hooks) {
            throw new ReferenceError(`Cannot add listener for hook "${hookName}": unknown hook`);
        }
        hooks.push(listener);
    }

    /**
     * Makes a request using ptl protocol. Uses buffering if it was started
     * @param  {Object}          action Projectile action description (name, action, args)
     * @return {Promise<Object>}        Projectile action result
     */
    makeRequest(action) {
        return new Promise((resolve, reject) => {
            this.buffer.push({ action, resolve, reject });
            if (!this.buffering) {
                return this.flushBuffer();
            }
        });
    }

    /**
     * Makes initial "sync *" request
     * @return {Promise<{[string]: PtlRemoteLayer}>} Hash of all obtained layers by names
     */
    sync() {
        return this.makeRequest({
            name: '*',
            action: 'sync'
        })
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    const layerSyncData = data[i];
                    this.layers[layerSyncData.name] = new PtlRemoteLayer(layerSyncData, this);
                }
                return this.layers;
            });
    }

    /**
     * Makes property get request
     * @param  {String}          fullPropertyName Property name with layer name, separated with '/'
     * @return {Promise<Object>}                  Projectile action result
     */
    getPropertyValue(fullPropertyName) {
        return this.makeRequest({
            name: fullPropertyName,
            action: 'get'
        });
    }
    /**
     * Makes property set request
     * @param  {String}          fullPropertyName Property name with layer name, separated with '/'
     * @param  {any}             value            Value to be set for property
     * @return {Promise<Object>}                  Projectile action result
     */
    setPropertyValue(fullPropertyName, value) {
        return this.makeRequest({
            name: fullPropertyName,
            action: 'set',
            args: [value]
        });
    }
    /**
     * Makes method call request
     * @param  {String}  methodName Full method name (with layer name)
     * @param  {Array}   args       Array of method arguments
     * @return {Promise}            Projectile action result
     */
    call(methodName, args) {
        return this.makeRequest({
            name: methodName,
            args
        });
    }


    /**
     * Enables request buffering mode for this client. In this mode, client stops
     * sending requests and buffers them until the buffer is manually flushed
     * @return {void}
     */
    startBuffering() {
        this.buffering = true;
        this.bufferingPromise = Promise.resolve(void 0);
    }
    /**
     * Stops buffering mode for this client and flushes the buffer.
     * @return {Promise} A Promise of request result. Resolved with Projectile request result section.
     */
    stopBufferingAndFlush() {
        this.buffering = false;
        return this.flushBuffer();
    }
    /**
     * Clears requests buffer and send them all (as one HTTP request)
     * @return {Promise} A Promise of request result. Resolved with Projectile request result section.
     */
    flushBuffer() {
        const localBuffer = this.buffer;
        this.buffer = [];
        return this.post(this.url, {
            ptl: 'req@' + this.version,
            ctx: this.context,
            do: localBuffer.map(b => b.action)
        })
            .then(({ ptl, ctx, result, errors, patch }) => {
                if (ptl !== 'res@' + this.version)
                    throw new PtlClientRequestError(`Versions mismatch: expected "res@${this.version}", got ${ptl}`);

                Object.assign(this.context, ctx);

                for (let layerName in patch) {
                    const remoteLayer = this.layers[layerName];
                    if (!remoteLayer) {
                        throw new ReferenceError(`Cannot apply patch for layer "${layerName}": layer not found`);
                    }
                    remoteLayer.applyPatch(patch[layerName]);
                }

                if (errors && errors.length) {
                    errors.forEach(error => console.error(error));
                    localBuffer.forEach(b => b.reject(errors[0]));
                    return this
                        .triggerHook('onResponseError', [this, errors[0]])
                        .then(() => Promise.reject(errors[0]));
                } else {
                    for (let i = 0; i < result.length; i++) {
                        const { data, error } = result[i];
                        if (error) {
                            localBuffer[i].reject(error);
                        } else {
                            localBuffer[i].resolve(data);
                        }
                    }
                    return this
                        .triggerHook('afterResponseProcessed', [this, result])
                        .then(() => result);
                }
            });
    }


    post() { throw new Error(`Post provider not specified`); }


    /**
     * Adds custom user type into this client's registry.
     * @param  {String | Object} name If string, used as name of type to register. If object, used as types hash.
     * @param  {Function}        T    Registered type (if name is string)
     */
    registerType(name, T) {
        if (typeof name === typeof '') {
            this.typesRegistry[name] = T;
        } else if (typeof name === typeof this) {
            Object.assign(this.typesRegistry, name);
        } else {
            throw new TypeError(`Invalid arguments for PtlClient::registerType`);
        }
    }
}

module.exports = PtlClient;
