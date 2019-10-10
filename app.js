const nunjucks = require('nunjucks');
const express = require('express');
const request = require('request-promise-native');
const healthcheck = require('@hmcts/nodejs-healthcheck');
const config = require('config');
const os = require('os');
const logging = require('@hmcts/nodejs-logging');
const logger = logging.Logger.getLogger(__filename);

const app = express();

const services = ['pfe', 'rfe', 'dn', 'da', 'cos', 'cms', 'cfs', 'dgs', 'emca','fps'];

app.listen(config.node.port, () => logger.info(`Listening on port ${config.node.port}!`));

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

async function fetchStatuses() {
  const results = [];

    for (const service of services) {
        try {
            let url = `http://div-${service}-${config.environment}.service.core-compute-${config.environment}.internal/health`;
            logger.info(`Checking status of ${service} - ${url}`);
            const response = await request.get(
                url,
                {
                    simple: false,
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    timeout: 3000
                }
            );
            const body = response.body;
            if(!isJsonString(body)) {
              logger.error('Response is not JSON', response);
              results.push(Object.assign({name: service, status: 'DOWN', message: `${response.statusCode} - ${response.statusMessage}`}));
              continue;
            }
            const data = JSON.parse(body);
            logger.info(`Successfully retrieved status of ${service}`);
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
            logger.error(`Error while checking status of ${service}`, e);
            results.push(Object.assign({name: service, status: 'DOWN', message: JSON.stringify(e.message)}));
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

app.get('/health/liveness', (req, res) => res.json({status: "UP"}));

app.use(logging.Express.accessLogger());