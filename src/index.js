const axios = require('axios');
const ptl = require('../ptl/client');
const dom = require('./dom');

const api = ptl.client({
    url: '/ptl',
    post(url, data) {
        return axios.post(url, data).then(response => response.data);
    }
});

window.api = api;
window.user = null;

function updateInterface() {
    const apil = window.apil;

    const nodes = [];

    nodes.push(dom('h2', {}, apil.title.get()));

    // nodes.push(dom('code', {}, apil.nested.prop.get()));
    // nodes.push(dom('code', {}, JSON.stringify(apil.nested().get())));

    if (window.apiError) {
        nodes.push(dom('pre', { style: 'color: red;' }, JSON.stringify(window.apiError)));
    }

    nodes.push(dom('pre', {}, JSON.stringify(api.context)));
    nodes.push(dom('h1', {}, String(apil.counter.get())));

    nodes.push(dom('div', {}, [
        dom('pre', {}, 'All object: ' + JSON.stringify(apil.point().get()))
    ]));

    nodes.push(dom('div', {}, Object.keys(apil.point).map(key => dom('div', {}, [
        dom('b', {}, `"${key}":`),
        dom('span', {}, String(apil.point[key].get()))
    ]))));

    const increasePoint = dom('button', {}, '+2, -1');
    increasePoint.addEventListener('click', function () {
        api.startBuffering();
        apil.point.x.set(apil.point.x.get() + 2);
        apil.point.y.set(apil.point.y.get() - 1);
        api.stopBufferingAndFlush().then(updateInterface);
    });
    const decreasePoint = dom('button', {}, '-1 +2');
    decreasePoint.addEventListener('click', function () {
        apil.point().set({
            x: apil.point.x.get() - 1,
            y: apil.point.y.get() + 2
        }).then(updateInterface).catch(e => { window.apiError = e; });
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
            }).catch(error => {
                window.apiError = error;
            }).then(updateInterface);
            ev.preventDefault();
            return false;
        });
        nodes.push(loginForm);
    } else {
        const logout = dom('button', { type: 'button' }, 'Sign Out');
        logout.addEventListener('click', function () {
            apil.logout()
                .then(() => { window.apiError = null; window.user = null; })
                .catch(e => { window.apiError = e; })
                .then(updateInterface);
        });
        nodes.push(logout);

        const increment = dom('button', { type: 'button' }, '++');
        increment.addEventListener('click', function () {
            return apil.increment()
                .then(() => { window.apiError = null; })
                .catch(e => { window.apiError = e; })
                .then(updateInterface);
        });
        const style = window.user.roles.includes('admin') ? '' : 'color: red;';
        const reset = dom('button', { type: 'button', style }, 'RESET');
        reset.addEventListener('click', function () {
            return apil.reset()
                .then(() => { window.apiError = null; })
                .catch(e => { window.apiError = e; })
                .then(updateInterface);
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
        window.apil = layers.api.plain();
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
