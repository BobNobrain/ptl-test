const axios = require('axios');

document.addEventListener('DOMContentLoaded', function () {
    const sendBtn = document.getElementById('send');
    const req = document.getElementById('req');
    const res = document.getElementById('res');
    const ctx = document.getElementById('ctx');

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
            res.innerText = '[ERROR]';
        });
    });
});
