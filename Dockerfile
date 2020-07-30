FROM hmctspublic.azurecr.io/base/node:12-alpine as base
USER hmcts
COPY --chown=hmcts:hmcts package.json yarn.lock ./
RUN yarn install --production
FROM base as runtime
COPY . .
EXPOSE 3000
