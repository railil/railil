require('dotenv').config();

const DEST_TYPES = {
    WORK: 'work',
    HOME: 'home'
};

const TelegramBot = require('node-telegram-bot-api');
const api = require('../api/');
const user = require('../user/');
const url = `https://${process.env.PUBLIC_URL}`;
const token = process.env.BOT_TOKEN;
const isProduction = process.env.NODE_ENV === "production";
const bot = new TelegramBot(token, !isProduction ? {polling: true} : {});

if(isProduction){
    bot.setWebHook(`${url}/bot${token}`);
}

const getTrainsHome = async date => {
    return api.getTrainsByDate(date, user.getToHomeStations());
};

const getTrainsWork = async date => {
    return api.getTrainsByDate(date, user.getToWorkStations());
};

async function defaultListResponse(type, msg) {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Работаю...');

    const now = Date.now();
    let trains, userStationsGetter;

    switch (type) {
        case DEST_TYPES.HOME:
            trains = await getTrainsHome(now);
            userStationsGetter = user.getToHomeStations;
            break;
        case DEST_TYPES.WORK:
            trains = await getTrainsWork(now);
            userStationsGetter = user.getToWorkStations;
            break;
        default:
            bot.sendMessage(chatId, 'В жизни что-то не получилось :(');
            return;
    }
    const allStations = await api.getAllStations();
    const { fromStation, toStation } = userStationsGetter();

    if (trains.length > 0) {
        bot.sendMessage(chatId, formatListResponse(trains, allStations, fromStation, toStation));
    } else {
        bot.sendMessage(chatId, 'Чет не нашел ничего :(');
    }
}

function formatListResponse(trains, stations, fromStation, toStation) {
    return (stations && `из ${stations[fromStation]} в ${stations[toStation]}`) +
        '\n' +
        `* ${trains.splice(0, 5).join('\n* ')}`;
}

// Matches "/домой"
bot.onText(/домой/i, defaultListResponse.bind(null, DEST_TYPES.HOME));

// Matches "/работать"
bot.onText(/работать/i, defaultListResponse.bind(null, DEST_TYPES.WORK));

module.exports = {bot};
