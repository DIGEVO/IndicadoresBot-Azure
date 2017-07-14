'use strict';

const httpService = require('./httpService');

module.exports = {

    toCompareValue(session) { },

    toKnowValue(session, funs) {
        const indicador = this._Indicators[session.dialogData.indicador];
        const fecha = this._formatDate(session.dialogData.fecha);
        const url = `http://mindicador.cl/api/${indicador}/${fecha}`;

        httpService.get(url)
            .then(function gotData(data) {
                const result = JSON.parse(data);
                session.send(`El indicador **${session.dialogData.indicador}** para la fecha **${fecha}** es **${result.serie.length != 0 ? result.serie[0].valor : "No existe valor en la fecha indicada"}**`);
                funs.forEach(f => f());
            })
            .catch(function (error) {
                session.send(`Lo sentimos, ha ocurrido el sgte error **${error}**`);
            });
    },

    _formatDate: (d) => `${d.getDate() > 9 ? d.getDate() : `0${d.getDate()}`}` +
        `-${d.getMonth() + 1 > 9 ? d.getMonth() + 1 : `0${d.getMonth() + 1}`}` +
        `-${d.getFullYear()}`,

    _Indicators: {
        'Unidad de fomento': 'uf',
        'Índice de valor promedio': 'ivp',
        'Dólar observado': 'dolar',
        'Dólar acuerdo': 'dolar_intercambio',
        'Euro': 'euro',
        'Índice de Precios al Consumidor': 'ipc',
        'Unidad Tributaria Mensual': 'utm',
        'Imacec': 'imacec',
        'Tasa Política Monetaria': 'tpm',
        'Libra de Cobre': 'libra_cobre',
        'Tasa de desempleo': 'tasa_desempleo'
    },
};



// var Indicators = {
//     uf: { name: "uf", startyear: 1977 }                   //Unidad de fomento.
//     , ivp: { name: "ivp", startyear: 1990 }                 //Indice de valor promedio.
//     , dolar: { name: "dolar", startyear: 1984 }               //Dólar observado.
//     , dolar_intercambio: { name: "dolar_intercambio", startyear: 1988 }   //Dólar acuerdo.
//     , euro: { name: "euro", startyear: 1999 }                //euro.
//     , ipc: { name: "ipc", startyear: 1928 }                 //Índice de Precios al Consumidor
//     , utm: { name: "utm", startyear: 1990 }                 //Unidad Tributaria Mensual.
//     , imacec: { name: "imacec", startyear: 2004 }              //Imacec.
//     , tpm: { name: "tpm", startyear: 2001 }                 //Tasa Política Monetaria.
//     , libra_cobre: { name: "libra_cobre", startyear: 2012 }        //Libra de Cobre.
//     , tasa_desempleo: { name: "tasa_desempleo", startyear: 2009 }    //Tasa de desempleo.
// }

