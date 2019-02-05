require('dotenv').config();

const DEST_TYPES = {
    WORK: 'work',
    HOME: 'home'
};
const TIME_REGEXP = /в ([0-9]{2})[:.]([0-9]{2})/i;

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

const sendMessage = (chat_id, text, params) => {
    const _params = {parse_mode:"Markdown",...params};
    bot.sendMessage(chat_id, text, _params);
}

const getTrainsHome = async date => {
    return api.getTrainsByDate(date, user.getToHomeStations());
};

const getTrainsWork = async date => {
    return api.getTrainsByDate(date, user.getToWorkStations());
};

const defaultListResponse = (type) => {
    return async (msg) => {
        const chatId = msg.chat.id;
        const allStations = await api.getAllStations();
        const date = new Date();
        const timeExecutor = TIME_REGEXP.exec(msg.text);
        const [, hour, min] = Array.isArray(timeExecutor) ? timeExecutor : [];

        let trains, userStationsGetter;

        await sendMessage(chatId, 'Работаю...');

        if (hour && min) {
            date.setHours(hour, min);
        }

        switch (type) {
            case DEST_TYPES.HOME:
                trains = await getTrainsHome(date.valueOf());
                userStationsGetter = user.getToHomeStations;
                break;
            case DEST_TYPES.WORK:
                trains = await getTrainsWork(date.valueOf());
                userStationsGetter = user.getToWorkStations;
                break;
            default:
                sendMessage(chatId, 'В жизни что-то не получилось :(');
                return;
        }
        const { fromStation, toStation } = userStationsGetter();

        if (trains.length > 0) {
            sendMessage(chatId, formatListResponse(trains, allStations, fromStation, toStation));
        } else {
            sendMessage(chatId, 'Чет не нашел ничего :(');
        }
    };
}

function formatListResponse(trains, stations, fromStation, toStation) {
    const separator = '・';
    return (stations && `🚂 *${stations[fromStation]}* ➡️ *${stations[toStation]}*`) +
        '\n' +
        `${separator} ${trains.splice(0, 5).map( train => `*${train.split(' ')[0]}* _${train.split(' ')[1]}_`).join(`\n${separator} `)}`;
}

// Matches "/домой"
bot.onText(/домой/i, defaultListResponse(DEST_TYPES.HOME));

// Matches "/работать"
bot.onText(/работать/i, defaultListResponse(DEST_TYPES.WORK));

module.exports = {bot};
