const ptl = require('../ptl');

const allowOnlyFor = roles => (layerContent, method, [context, ...args]) => {
    if (context.data.roles.some(r => roles.includes(r))) {
        return method.apply(layerContent, args);
    }
    return ptl.reject('Forbidden', 403);
};

const apiLayer = ptl.layer('api', {
    counter: ptl.number(0).readonly(),
    title: ptl.string('ptl test').readonly(),

    tokens: ptl.hash().internal(),

    increment: ptl.method(function () {
        this.counter++;
        return this.counter;
    }).wrap(allowOnlyFor(['user'])).contextual(),

    reset: ptl.method(function () {
        this.counter = 0;
    }).wrap(allowOnlyFor(['admin'])).contextual(),

    echo: ptl.method(function (...strings) {
        const result = strings.join(' ');
        console.log(result);
        return Promise.resolve(strings);
    }),

    time: ptl.arrow(() => Date.now()),

    auth: ptl.method(function (context, { username, password }) {
        let roles = [];
        if (username === 'bob' && password === '111') {
            roles = ['admin', 'user'];
        }
        if (username === 'alice' && password === '222') {
            roles = ['user'];
        }
        if (roles.length) {
            const token = Date.now();
            this.tokens[token] = {
                username,
                password,
                roles
            };
            context.send({ token });
            return this.tokens[token];
        }
        ptl.raise('Wrong credentials', 401);
    }).contextual(),

    logout: ptl.method(function (context) {
        const token = context.data.token;
        if (token && this.tokens[token]) {
            context.send({ token: null });
            delete this.tokens[token];
        } else {
            ptl.raise('Unauthorized', 401);
        }
    }).contextual()
});

const server = ptl.httpServer('/ptl');
server.addLayer(apiLayer);
server.onRequest((context, layers) => {
    const token = context.data.token || null;
    const user = layers.api.plain().tokens[token];
    if (user) {
        context.data.roles = user.roles;
    } else {
        // return ptl.reject('Unauthorized', 401);
        context.data.roles = [];
    }
    return Promise.resolve(void 0);
});

module.exports = server;
