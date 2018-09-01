const axios = require('axios');

document.addEventListener('DOMContentLoaded', function () {
    const sendBtn = document.getElementById('send');
    const req = document.getElementById('req');
    const res = document.getElementById('res');
    const ctx = document.getElementById('ctx');

    sendBtn.addEventListener('click', function () {
        const actions = JSON.parse(req.value);
        axios.post('/ptl', {
            ptl: 'req@0.0.1',
            ctx: JSON.parse(ctx.value),
            do: actions
        }).then(response => {
            console.log(response);
            res.innerText = JSON.stringify(response.data, null, 4);
        }).catch(error => {
            console.error(error);
            res.innerText = '[ERROR]';
        });
    });
});
