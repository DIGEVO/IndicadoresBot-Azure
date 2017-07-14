'use strict';

require('dotenv').config();

module.exports = {
    getDateWithoutTime: (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()),

    greetting(session) {
        const userLocalTime = new Date(session.message.localTimestamp);
        const hour = userLocalTime.getHours();
        return hour < 12 ? 'buenos días' : hour >= 19 ? 'buenas noches' : 'buenas tardes';
    },

    startServer(connector) {
        if (process.env.NODE_ENV == 'development') {
            var restify = require('restify');
            var server = restify.createServer();
            server.listen(process.env.PORT, function () {
                console.log('test bot endpont at http://localhost:3978/api/messages');
            });
            server.post('/api/messages', connector.listen());
        } else {
            module.exports = { default: connector.listen() }
        }
    },

    getConnector(builder) {
        const botbuilder_azure = require('botbuilder-azure');
        return process.env.NODE_ENV == 'development' ?
            new builder.ChatConnector() :
            new botbuilder_azure.BotServiceConnector({
                appId: process.env['MicrosoftAppId'],
                appPassword: process.env['MicrosoftAppPassword'],
                stateEndpoint: process.env['BotStateEndpoint'],
                openIdMetadata: process.env['BotOpenIdMetadata']
            });
    },

    Indicators: {
        0: 'Unidad de fomento',
        1: 'Índice de valor promedio',
        2: 'Dólar observado',
        3: 'Dólar acuerdo',
        4: 'Euro',
        5: 'Índice de Precios al Consumidor',
        6: 'Unidad Tributaria Mensual',
        7: 'Imacec',
        8: 'Tasa Política Monetaria',
        9: 'Libra de Cobre',
        10: 'Tasa de desempleo'
    }

};