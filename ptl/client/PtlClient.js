const PtlRemoteLayer = require('./PtlRemoteLayer');
const { PtlError } = require('../util/errors');

class PtlClientRequestError extends PtlError {
    constructor(error) {
        super(error.message, error.code);
        this.error = error;
    }
}

class PtlClient {
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
    }

    makeRequest(action) {
        return new Promise((resolve, reject) => {
            this.buffer.push({ action, resolve, reject });
            if (!this.buffering) {
                return this.flushBuffer();
            }
        });
    }

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

    getPropertyValue(fullPropertyName) {
        return this.makeRequest({
            name: fullPropertyName,
            action: 'get'
        });
    }
    setPropertyValue(fullPropertyName, value) {
        return this.makeRequest({
            name: fullPropertyName,
            action: 'set',
            args: [value]
        });
    }
    call(methodName, args) {
        return this.makeRequest({
            name: methodName,
            args
        });
    }

    // ////////////////// //
    // requests buffering //
    // ////////////////// //
    startBuffering() {
        this.buffering = true;
        this.bufferingPromise = Promise.resolve(void 0);
    }
    stopBufferingAndFlush() {
        this.buffering = false;
        return this.flushBuffer();
    }
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
                    return Promise.reject(errors[0]);
                } else {
                    for (let i = 0; i < result.length; i++) {
                        const { data, error } = result[i];
                        if (error) {
                            localBuffer[i].reject(error);
                        } else {
                            localBuffer[i].resolve(data);
                        }
                    }
                    return Promise.resolve(result);
                }
            });
    }

    post() { throw new Error(`Post provider not specified`); }

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
