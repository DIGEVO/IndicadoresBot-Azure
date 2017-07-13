"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var azure = require('azure-storage');
var path = require('path');

require('dotenv').config();
const RestClient = require('./BusinessLogic/RestClient');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ?
    new builder.ChatConnector() :
    new botbuilder_azure.BotServiceConnector({
        appId: process.env['MicrosoftAppId'],
        appPassword: process.env['MicrosoftAppPassword'],
        stateEndpoint: process.env['BotStateEndpoint'],
        openIdMetadata: process.env['BotOpenIdMetadata']
    });

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

//todo hacerlo proactivo, en cuanto se conecte q me salude y pregunte.
bot.dialog('/', [
    function (session, result, next) {
        //ver la hora del usuario y saludarlo apropidamente...
        builder.Prompts.choice(session,
            `Hola ${session.message.user.name}, ¿cuál acción desea realizar?`,
            'Comparar valor de indicador|Conocer valor de indicador',
            { listStyle: builder.ListStyle.button });
    },
    function (session, result) {
        session.dialogData.opcion = result.response.entity;
        builder.Prompts.choice(session, '¿Cuál de los siguientes indicadores deseas conocer?',
            Indicators.join('|'),
            { listStyle: builder.ListStyle.list });
    },
    function (session, results) {
        session.dialogData.indicador = results.response.entity;
        builder.Prompts.time(session,
            `¿De cuál fecha desea ${session.dialogData.opcion.toLowerCase()}?`);
    },
    function (session, results) {
        //buscar la forma de traducir los resultados a español
        session.dialogData.fecha = builder.EntityRecognizer.resolveTime([results.response]);

        if (getDateWithoutTime(session.dialogData.fecha) > new Date().getTime()) {
            session.endDialog(`Uff! desea predecir y ${session.dialogData.opcion.toLowerCase()} **${session.dialogData.indicador}**, 
        de la fecha **${session.dialogData.fecha.toDateString()}**`);
        } else {
            if (session.dialogData.opcion == 'Conocer valor de indicador') {
                RestClient.toKnowValue(session);
            } else {
                session.endDialog(`Trabajando para darte la comparación del valor del indicador 
                **${session.dialogData.indicador}** de la fecha **${session.dialogData.fecha.toDateString()}** 
                con respecto a la fecha actual`);
            }
        }
    }
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}

const Indicators = ['Unidad de fomento', 'Indice de valor promedio',
    'Dólar observado', ' Dólar acuerdo', 'Euro',
    'Índice de Precios al Consumidor',
    'Unidad Tributaria Mensual', 'Imacec',
    'Tasa Política Monetaria',
    'Libra de Cobre', 'Tasa de desempleo'];

const getDateWithoutTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
