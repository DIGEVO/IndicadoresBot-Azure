'use strict';

const builder = require('botbuilder');

const Utils = require('./Utils');
const RestClient = require('./RestClient');

module.exports = {
    /*
    */
    chooseAction(session, results, next) {
        const firstName = session.message.user.name.split(" ", 1)[0];
        const greetings = Utils.greetting(session);
        const introduceBot = session.privateConversationData.continue ?
            '¿Cuál acción desea realizar?' :
            `Hola ${firstName}, ${greetings}, ¿cuál acción desea realizar?`;

        builder.Prompts.choice(session, introduceBot,
            'Comparar valor de indicador|Conocer valor de indicador',
            { listStyle: builder.ListStyle.button });
    },
    /*
    */
    chooseIndicator(session, results) {
        session.dialogData.opcion = results.response.entity;
        builder.Prompts.choice(session, '¿Cuál de los siguientes indicadores deseas conocer?',
            Object.values(Utils.Indicators).join('|'),
            { listStyle: builder.ListStyle.list });
    },
    /*
    */
    provideDate(session, results) {
        session.dialogData.indicador = results.response.entity;
        builder.Prompts.time(session,
            `¿De cuál fecha desea ${session.dialogData.opcion.toLowerCase()}?`);
    },
    /*
    */
    realizeIntention(session, results) {
        session.dialogData.fecha = builder.EntityRecognizer.resolveTime([results.response]);

        if (Utils.getDateWithoutTime(session.dialogData.fecha) > new Date().getTime()) {
            session.send(`Uff! desea predecir y ${session.dialogData.opcion.toLowerCase()} **${session.dialogData.indicador}**, de la fecha **${session.dialogData.fecha.toDateString()}**`);
        } else {
            session.privateConversationData.continue = true;
            if (session.dialogData.opcion == 'Conocer valor de indicador') {
                RestClient.toKnowValue(
                    session,
                    [() => builder.Prompts.confirm(session, '¿Desea continuar?', { listStyle: builder.ListStyle.button })]);
            } else {
                session.send(`Trabajando para darte la comparación del valor del indicador **${session.dialogData.indicador}** de la fecha **${session.dialogData.fecha.toDateString()}** con respecto a la fecha actual`);
                builder.Prompts.confirm(session, '¿Desea continuar?', { listStyle: builder.ListStyle.button });
            }
        }
    }
};