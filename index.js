const path = require('path');
const TestHttpServer = require('./server');

const server = new TestHttpServer({
    staticPath: path.join(__dirname, 'dist'),
    ptlUrl: '/ptl',
    port: process.env.PORT || 3001
});

server.start();
