const nunjucks = require('nunjucks');
const express = require('express');
const request = require('request-promise-native').defaults({'proxy': 'http://proxyout.reform.hmcts.net:8080'});
const healthcheck = require('@hmcts/nodejs-healthcheck');
const config = require('config');
const os = require('os');

const app = express();

const port = 3000;
const services = ['pfe', 'rfe', 'dn', 'cos', 'cms', 'cfs', 'fps', 'vs'];
const env = 'aat';

app.listen(port, () => console.log(`Listening on port ${port}!`));

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

async function fetchStatuses() {
    const results = [];

    for (const service of services) {
        try {
            console.log(`Checking status of ${service}`);
            const data = await request.get(
                `http://div-${service}-${config.environment}.service.core-compute-${config.environment}.internal/health`,
                {
                    json: true,
                    simple: false,
                    rejectUnauthorized: false,
                    timeout: 3000
                }
            );
            console.log(`Successfully retrieved status of ${service}`);
            let filteredDetails = {};
            if (!data.hasOwnProperty('details')) {
                const nonServiceKeys = ['status', 'buildInfo'];
                filteredDetails = Object.keys(data)
                    .filter(key => !nonServiceKeys.includes(key))
                    .reduce((obj, key) => {
                        obj[key] = data[key];
                        return obj;
                    }, {});
            }
            results.push(Object.assign({name: service, details: filteredDetails}, data));
        } catch (e) {
            console.error(`Error while checking status of ${service}`, e.message);
            results.push(Object.assign({name: service, status: 'DOWN', message: e.message}));
        }
    }
    return results;
}

app.get('/', async function (req, res) {
    const results = await fetchStatuses();

    res.render('index.njk', {
        title: `Divorce Monitor - ${config.environment}`,
        services: results
    });
});

app.get('/health', healthcheck.configure({
    checks: () => {},
    buildInfo: {
        name: config.service.name,
        host: os.hostname(),
        uptime: process.uptime()
    }
}));
