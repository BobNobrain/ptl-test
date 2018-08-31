const http = require('http');

const ptl = require('../ptl');
const StaticServer = require('./static');

class TestHttpServer {
    constructor({ staticPath, port, ptlUrl }) {
        // this.staticPath = staticPath;
        this.staticServer = new StaticServer(staticPath);
        this.port = port;

        const handleError = (req, res, error) => {
            const code = typeof error.code === typeof 0 ? error.code : 500;
            console.error(`${req.method} ${req.url}: error ${code} '${error.message}'`);
            console.error(error);

            res.statusCode = code;
            res.end(error.message);
        };

        this.server = http.createServer((req, res) => {
            try {
                if (req.url === ptlUrl) {
                    return ptl.handle(req, res, handleError);
                } else {
                    return this.staticServer.handle(req, res, handleError);
                }
            } catch (error) {
                handleError(req, res, error);
            }
        });
    }

    start() {
        this.server.listen(this.port, error => {
            if (error) {
                console.error(error);
            }
            console.log(`Server listening on http://localhost:${this.port}/`);
        });
    }
}

module.exports = TestHttpServer;
