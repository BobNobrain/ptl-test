const fs = require('fs');
const path = require('path');
// const qs = require('querystring');

class HttpError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

class StaticServer {
    constructor(staticPath) {
        this.staticPath = staticPath;
    }

    handle(req, res, onError) {
        if (req.method !== 'GET') {
            throw new HttpError(405, 'Method not Allowed');
        }
        let filename = path.join(this.staticPath, req.url);
        if (filename.endsWith('/')) {
            filename += 'index.html';
        }
        console.log(`GET static` + filename);
        fs.readFile(filename, function (error, data) {
            if (error) {
                if (error.code === 'ENOENT') {
                    error.code = 404;
                    error.message = 'Not Found';
                }
                return onError(req, res, error);
            } else {
                res.write(data);
                res.end();
            }
        });
    }
}

module.exports = StaticServer;
