'use strict';

const http = require('http');
const url = require('url');

module.exports = {
    get(url) {
        return this._makeRequest('GET', url);
    },

    _makeRequest(method, urlString, options) {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(urlString);
            const requestOptions = this._createOptions(method, parsedUrl);
            const request = http.get(requestOptions, res =>
                this._onResponse(res, resolve, reject));

            /* if there's an error, then reject the Promise
             * (can be handled with Promise.prototype.catch) */
            request.on('error', reject);

            request.end();
        });
    },

    _createOptions(method, url) {
        return {
            hostname: url.hostname,
            path: url.path,
            port: !url.port ? 80 : url.port,
            method: method
        };
    },

    _onResponse(response, resolve, reject) {
        const hasResponseFailed = response.status >= 400;
        var responseBody = '';

        if (hasResponseFailed) {
            reject(`Request to ${response.url} failed with HTTP ${response.status}`);
        }

        response.on('data', chunk => responseBody += chunk.toString());

        response.on('end', () => resolve(responseBody));
    }
};
