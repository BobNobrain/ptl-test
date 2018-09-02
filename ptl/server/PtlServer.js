const PtlLayer = require('../core/PtlLayer');
const { PtlError } = require('../util/errors');
const processPtlAction = require('./processPtlAction');

const wrapActionResultOrError = promiseOrValue =>
    Promise.resolve(promiseOrValue) // ensure result to be a Promise
        .then(data => ({ data, error: null }))
        .catch(error => ({
            data: null,
            error: {
                message: error.message,
                code: error.code,
                type: error.constructor.name
            }
        }))
;

class PtlServer {
    constructor() {
        this.version = '0.0.1';
        this.layers = {};
        this.onRequestHandlers = [];
    }

    addLayer(ptlLayer) {
        if (!(ptlLayer instanceof PtlLayer)) {
            throw new TypeError(`Cannot add ${ptlLayer} to PtlServer: not a PtlLayer`);
        }
        this.layers[ptlLayer.getName()] = ptlLayer;
    }

    handleWrapped(data) {
        // Matching protocol versions
        const ptl = 'req@' + this.version;
        if (data.ptl !== ptl) throw new PtlError(`Ptl versions mismatch: expected ${ptl}, got ${data.ptl}`, 400);

        // preparing objects for context and layer manipultation
        const responseContext = {};
        const context = {
            data: data.ctx,
            send(props) {
                Object.assign(responseContext, props);
            }
        };
        const exposedLayers = Object.assign({}, this.layers);
        const watchedLayers = {};

        return Promise.all(
            // running user middleware
            this.onRequestHandlers.map(handler => handler(context, exposedLayers))
        )
            .then(() => Promise.all(
                data.do
                    // run all actions
                    .map(todo => processPtlAction(todo, exposedLayers, context, watchedLayers))
                    // convert to { data, error } structure
                    .map(wrapActionResultOrError)
            ))
            .then(result => {
                // accumulate a patch of changed data
                const patch = {};
                for (let watchedLayerName in watchedLayers) {
                    const changes = exposedLayers[watchedLayerName].checkChanges();
                    exposedLayers[watchedLayerName].endWatch();
                    patch[watchedLayerName] = changes;
                }
                return { result, responseContext, patch };
            })
        ;
    }

    handle(req, res) {
        let parsed = false;
        return Promise.resolve(void 0)
            .then(() => {
                if (req.method !== 'POST') {
                    throw new PtlError('Method not Allowed', 405);
                }
                const jbody = JSON.parse(req.body);
                parsed = true;
                return this.handleWrapped(jbody);
            })
            .then(({ result, responseContext, patch }) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ptl: 'res@' + this.version,
                    ctx: responseContext,
                    patch,
                    result
                }));
            })
            .catch(error => {
                console.error(error);
                if (typeof error.code === typeof 0) {
                    res.statusCode = error.code;
                } else {
                    if (parsed) {
                        res.statusCode = 500;
                    } else {
                        console.error(req);
                        res.statusCode = 400;
                    }
                }
                res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ptl: 'res@' + this.version,
                    ctx: {},
                    result: null,
                    errors: [{
                        message: error.message
                    }]
                }));
            })
        ;
    }

    onRequest(handler) {
        this.onRequestHandlers.push(handler);
    }
}

module.exports = PtlServer;
