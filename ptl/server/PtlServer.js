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

/**
 * @class Runs Projectile server
 * @property {String} version Supported protocol version
 * @property {Object} layers  Layers hash by name
 */
class PtlServer {
    /**
     * Instantiates new server
     */
    constructor() {
        this.version = '0.0.1';
        this.layers = {};
        this.onRequestHandlers = [];
    }

    /**
     * Adds layer to server
     * @param  {PtlLayer} ptlLayer Layer to add
     * @return {PtlServer}         this
     * @throws {TypeError} If ptlLayer is not a PtlLayer
     * @chainable
     */
    addLayer(ptlLayer) {
        if (!(ptlLayer instanceof PtlLayer)) {
            throw new TypeError(`Cannot add ${ptlLayer} to PtlServer: not a PtlLayer`);
        }
        this.layers[ptlLayer.getName()] = ptlLayer;
        return this;
    }

    /**
     * Does main request processing
     * @param  {Object} data Request data
     * @return {Object}      Response data
     */
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

    /**
     * Http request processing
     * @param  {HttpRequest}  req Incoming Projectile Http Request
     * @param  {HttpResponse} res Outcoming Projectile Http Response
     * @return {Promise}          Promise that resolves when request is handled
     */
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

    /**
     * Adds custom request handler. It will be called before the server handles Projectile actions.
     * @param  {Function}  handler Handler to add, called with server context and writable layers hash
     * @return {PtlServer}         this
     * @chainable
     */
    onRequest(handler) {
        this.onRequestHandlers.push(handler);
        return this;
    }
}

module.exports = PtlServer;
