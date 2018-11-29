const nunjucks = require('nunjucks');
const express = require('express');
const request = require('request-promise-native').defaults({'proxy': 'http://proxyout.reform.hmcts.net:8080'});

const app = express();

const port = 4000;

app.listen(port, () => console.log(`Listening on port ${port}!`));

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.get('/', async function (req, res) {
    const results = [];

    const services = ['pfe', 'rfe', 'dn', 'cos', 'cms', 'cfs', 'vs'];
    const env = 'aat';

    for (const service of services) {
        try {
            console.log(`Checking status of ${service}`);
            const data = await request.get(
                `http://div-${service}-${env}.service.core-compute-${env}.internal/health`,
                {
                    json: true,
                    simple: false
                }
            );
            console.log(`Successfully retrieved status of ${service}`);
            results.push(Object.assign({name: service}, data));
        } catch (e) {
            console.error(`Error while checking status of ${service}`, e.message);
            results.push(Object.assign({name: service, status: 'error'}));
        }
    }

    res.render('index.njk', {
        title: 'Div Monitor',
        services: results
    });
});
