const axios = require('axios');
const ptl = require('../ptl/client');

const api = ptl.client({
    url: '/ptl',
    post(url, data) {
        return axios.post(url, data).then(response => response.data);
    }
});

window.api = api;

document.addEventListener('DOMContentLoaded', function () {
    const sendBtn = document.getElementById('send');
    const syncBtn = document.getElementById('sync');
    const req = document.getElementById('req');
    const res = document.getElementById('res');
    const ctx = document.getElementById('ctx');

    syncBtn.addEventListener('click', function () {
        api.sync().then(data => {
            res.innerText = JSON.stringify(data, null, 4);
        });
    });

    sendBtn.addEventListener('click', function () {
        let reqv = req.value;
        if (reqv[0] !== '[') reqv = '[' + reqv + ']';
        const actions = JSON.parse(reqv);
        const ctxv = JSON.parse(ctx.value);
        axios.post('/ptl', {
            ptl: 'req@0.0.1',
            ctx: ctxv,
            do: actions
        }).then(response => {
            console.log(response);
            res.innerText = JSON.stringify(response.data, null, 4);

            // set context
            Object.assign(ctxv, response.data.ctx);
            ctx.value = JSON.stringify(ctxv);
        }).catch(error => {
            console.error(error);
            res.innerText = '[ERROR]\n' + JSON.stringify(error, null, 4);
        });
    });
});
