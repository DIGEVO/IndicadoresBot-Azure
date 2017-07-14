'use strict';

var builder = require('botbuilder');
var path = require('path');

require('dotenv').config();

const Utils = require('./BusinessLogic/Utils');
const Logic = require('./BusinessLogic/Logic');

var connector = Utils.getConnector(builder);

var bot = new builder.UniversalBot(connector, {
    localizerSettings: { 
        defaultLocale: process.env.DEFAULT_LOCALE 
    }
});

bot.localePath(path.join(__dirname, './locale'));

//TODO hacerlo proactivo, en cuanto se conecte q me salude y pregunte.
bot.dialog('/', [
    Logic.chooseAction,
    Logic.chooseIndicator,
    Logic.provideDate,
    Logic.realizeIntention,
    (session, results) => {
        if (!results.response) {
            session.endConversation(`Hasta la próxima ${session.message.user.name.split(" ", 1)[0]}`);
        } else {
            session.replaceDialog('/', { reprompt: true });
        }
    }
]);

Utils.startServer(connector);
