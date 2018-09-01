const PtlLayer = require('../core/PtlLayer');
const { PtlError } = require('../util/errors');

class PtlServer {
    constructor() {
        this.version = '0.0.1';
        this.layers = {};
        this.onRequestHandler = null;
    }

    addLayer(ptlLayer) {
        if (!(ptlLayer instanceof PtlLayer)) {
            throw new TypeError(`Cannot add ${ptlLayer} to PtlServer: not a PtlLayer`);
        }

        this.layers[ptlLayer.getName()] = ptlLayer;
    }

    handleWrapped(data) {
        const ptl = 'req@' + this.version;
        if (data.ptl !== ptl) throw new PtlError(`Ptl versions mismatch: expected ${ptl}, got ${data.ptl}`, 400);

        const responseContext = {};
        const context = {
            data: data.ctx,
            send(props) {
                Object.assign(responseContext, props);
            }
        };

        const exposedLayers = Object.assign({}, this.layers);

        return (
            typeof this.onRequestHandler === typeof Function
                ? this.onRequestHandler(context, exposedLayers)
                : Promise.resolve(void 0)
        )
            .then(() => {
                return Promise.all(data.do
                    .map(todo => {
                        const { name, args, action = 'call' } = todo;
                        const [layerName, propPath] = name.split('/');
                        if (!propPath) {
                            return Promise.reject(new ReferenceError(`"${name}": layer not specified`));
                        }

                        if (exposedLayers[layerName]) {
                            if (action === 'call') {
                                return exposedLayers[layerName].call(context, propPath.split('.'), args);
                            } else {
                                const property = exposedLayers[layerName].getProperty(propPath.split('.'));
                                if (action === 'get') {
                                    return property.valueOf();
                                } else if (action === 'set') {
                                    return property.value(...args);
                                } else {
                                    throw new PtlError('Unknown action ' + action, 400);
                                }
                            }
                        } else {
                            return Promise.reject(
                                new ReferenceError(`Unknown layer "${layerName}"`)
                            );
                        }
                    })
                    .map(promise => promise
                        .then(data => ({ data, error: null }))
                        .catch(error => ({
                            data: null,
                            error: {
                                message: error.message,
                                code: error.code,
                                type: error.constructor.name
                            }
                        }))
                    )
                );
            })
            .then(result => ({ result, responseContext }))
        ;
    }

    handle(req, res) {
        let parsed = false;
        return Promise.resolve(void 0)
            .then(() => {
                const body = req.body;
                if (req.method !== 'POST') {
                    throw new PtlError('Method not Allowed', 405);
                }
                const jbody = JSON.parse(body);
                parsed = true;
                return this.handleWrapped(jbody);
            })
            .then(({ result, responseContext }) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ptl: 'res@' + this.version,
                    ctx: responseContext,
                    result
                }));
            })
            .catch(error => {
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

    initLayers() {
        for (let name in this.layers) {
            this.layers[name].init();
        }
    }

    onRequest(handler) {
        this.onRequestHandler = handler;
    }
}

module.exports = PtlServer;
