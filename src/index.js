const axios = require('axios');
const ptl = require('../ptl/client');
const dom = require('./dom');

const api = ptl.client({
    url: '/ptl',
    post(url, data) {
        return axios.post(url, data).then(response => response.data);
    }
});
api.addHookListener('afterResponseProcessed', updateInterface);
api.addHookListener('onResponseError', (client, error) => {
    window.apiError = error;
    updateInterface();
});

window.api = api;
window.user = null;

function updateInterface() {
    if (!window.api.layers.api) return;
    const apil = window.api.layers.api.plain();

    const nodes = [];

    nodes.push(dom('h2', {}, apil.title()));

    if (window.apiError) {
        nodes.push(dom('pre', { style: 'color: red;' }, JSON.stringify(window.apiError)));
    }

    nodes.push(dom('pre', {}, JSON.stringify(api.context)));
    nodes.push(dom('h1', {}, String(apil.counter())));

    nodes.push(dom('div', {}, [
        dom('pre', {}, 'All object: ' + JSON.stringify(apil.point().get()))
    ]));

    nodes.push(dom('div', {}, Object.keys(apil.point).map(key => dom('div', {}, [
        dom('b', {}, `"${key}":`),
        dom('span', {}, String(apil.point[key]()))
    ]))));

    const increasePoint = dom('button', {}, '+2, -1');
    increasePoint.addEventListener('click', function () {
        api.startBuffering();
        apil.point.x = apil.point.x() + 2;
        apil.point.y = apil.point.y() - 1;
        api.stopBufferingAndFlush();
    });
    const decreasePoint = dom('button', {}, '-1 +2');
    decreasePoint.addEventListener('click', function () {
        apil.point().set({
            x: apil.point.x() - 1,
            y: apil.point.y() + 2
        });
    });

    nodes.push(dom('div', {}, [increasePoint, decreasePoint]));

    if (!window.user) {
        const usernameInput = dom('input', { type: 'text', placeholder: 'bob', name: 'username' });
        const passwordInput = dom('input', { type: 'text', placeholder: '111', name: 'password' });
        const loginForm = dom('form', {}, [
            usernameInput,
            passwordInput,
            dom('input', { type: 'submit', value: 'Sign In' })
        ]);
        loginForm.addEventListener('submit', function (ev) {
            apil.auth({
                username: usernameInput.value,
                password: passwordInput.value
            }).then(user => {
                window.user = user;
                window.apiError = null;
                updateInterface();
            }).catch(error => {
                window.apiError = error;
            });
            ev.preventDefault();
            return false;
        });
        nodes.push(loginForm);
    } else {
        const logout = dom('button', { type: 'button' }, 'Sign Out');
        logout.addEventListener('click', function () {
            apil.logout()
                .then(() => { window.apiError = null; window.user = null; updateInterface(); })
                .catch(e => { window.apiError = e; });
        });
        nodes.push(logout);

        const increment = dom('button', { type: 'button' }, '++');
        increment.addEventListener('click', function () {
            return apil.increment()
                .then(() => { window.apiError = null; })
                .catch(e => { window.apiError = e; });
        });
        const style = window.user.roles.includes('admin') ? '' : 'color: red;';
        const reset = dom('button', { type: 'button', style }, 'RESET');
        reset.addEventListener('click', function () {
            return apil.reset()
                .then(() => { window.apiError = null; })
                .catch(e => { window.apiError = e; });
        });

        nodes.push(increment);
        nodes.push(reset);
    }

    nodes.push(dom('hr'));

    const startBuffering = dom('button', { type: 'button' }, 'Start buffering');
    startBuffering.addEventListener('click', () => {
        api.startBuffering();
    });
    nodes.push(startBuffering);
    const stopBuffering = dom('button', { type: 'button' }, 'Stop buffering & flush');
    stopBuffering.addEventListener('click', () => {
        api.stopBufferingAndFlush();
    });
    nodes.push(stopBuffering);
    const flush = dom('button', { type: 'button' }, 'Flush');
    flush.addEventListener('click', () => {
        api.flushBuffer();
    });
    nodes.push(flush);


    const root = dom('div', {}, nodes);

    const ui = document.getElementById('ui');
    ui.innerHTML = '';
    ui.appendChild(root);
}

document.addEventListener('DOMContentLoaded', function () {
    api.sync().then(layers => {
        // window.apil = layers.api.plain();
        updateInterface();
    }).catch(e => console.error(e));


    // const sendBtn = document.getElementById('send');
    // const syncBtn = document.getElementById('sync');
    // const req = document.getElementById('req');
    // const res = document.getElementById('res');
    // const ctx = document.getElementById('ctx');

    // syncBtn.addEventListener('click', function () {
    //     api.sync().then(data => {
    //         res.innerText = JSON.stringify(data, null, 4);
    //     });
    // });

    // sendBtn.addEventListener('click', function () {
    //     let reqv = req.value;
    //     if (reqv[0] !== '[') reqv = '[' + reqv + ']';
    //     const actions = JSON.parse(reqv);
    //     const ctxv = JSON.parse(ctx.value);
    //     axios.post('/ptl', {
    //         ptl: 'req@0.0.1',
    //         ctx: ctxv,
    //         do: actions
    //     }).then(response => {
    //         console.log(response);
    //         res.innerText = JSON.stringify(response.data, null, 4);

    //         // set context
    //         Object.assign(ctxv, response.data.ctx);
    //         ctx.value = JSON.stringify(ctxv);
    //     }).catch(error => {
    //         console.error(error);
    //         res.innerText = '[ERROR]\n' + JSON.stringify(error, null, 4);
    //     });
    // });
});
