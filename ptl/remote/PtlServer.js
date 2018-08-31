const PtlLayer = require('../core/PtlLayer');

class HttpError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

class PtlServer {
    constructor() {
        this.version = '0.0.1';
        this.layers = {};
        this.context = null;
    }

    addLayer(ptlLayer) {
        if (!(ptlLayer instanceof PtlLayer)) {
            throw new TypeError(`Cannot add ${ptlLayer} to PtlServer: not a PtlLayer`);
        }

        this.layers[ptlLayer.getName()] = ptlLayer;
    }
    setContextLayer(ptlLayer) {
        if (!(ptlLayer instanceof PtlLayer)) {
            throw new TypeError(`Cannot add ${ptlLayer} to PtlServer: not a PtlLayer`);
        }
        this.context = ptlLayer;
    }

    handleWrapped(data) {
        const ptl = 'req@' + this.version;
        if (data.ptl !== ptl) throw new HttpError(400, `Ptl versions mismatch: expected ${ptl}, got ${data.ptl}`);

        return [{
            error: 'Not implemented!'
        }];
    }

    handle(req, res) {
        const body = req.body;
        let parsed = false;
        try {
            if (req.method !== 'POST') {
                throw new HttpError(405, 'Method not Allowed');
            }
            const jbody = JSON.parse(body);
            parsed = true;
            const result = this.handleWrapped(jbody);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                ptl: 'res@' + this.version,
                ctx: this.context.root,
                result
            }));
        } catch (error) {
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
                ctx: this.context.root,
                result: null,
                errors: [{
                    message: error.message
                }]
            }));
        }
    }

    initLayers() {
        for (let name in this.layers) {
            this.layers[name].init();
        }
    }
}

module.exports = PtlServer;
