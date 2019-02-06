require('dotenv').config();

const DEST_TYPES = {
    WORK: 'work',
    HOME: 'home'
};
const TIME_REGEXP = /в ([0-9]{2})[:.]([0-9]{2})/i;

const TelegramBot = require('node-telegram-bot-api');
const api = require('../api');
const user = require('../user');
const url = `https://${process.env.PUBLIC_URL}`;
const token = process.env.BOT_TOKEN;
const isProduction = process.env.NODE_ENV === "production";
const bot = new TelegramBot(token, !isProduction ? {polling: true} : {});

if(isProduction){
    bot.setWebHook(`${url}/bot${token}`);
}

const sendMessage = (chat_id, text, params) => {
    const _params = {parse_mode:"Markdown",...params};
    return bot.sendMessage(chat_id, text, _params);
};

const getTrainsHome = async date => {
    return api.getTrainsByDate(date, user.getToHomeStations());
};

const getTrainsWork = async date => {
    return api.getTrainsByDate(date, user.getToWorkStations());
};

const formatListResponse = (trains, stations, fromStation, toStation) => {
    const separator = '・';
    const format = 'HH:mm';
    let response = [];

    stations && response.push(`🚂 *${stations[fromStation]}* ➡️ *${stations[toStation]}*\n`);
    trains.splice(0, 5).forEach(train => {
        const {hasReservedSeat, departure, arrival, trainNumber, delay, load} = train;
        const delayOutput = delay ? `💢${delay}` : '';
        const loadOutput = load > 0.5 ? '👺' : '‍';
        const reservedSeatOutput =  hasReservedSeat ? '🎟' : '';
        response.push(`${separator} _#${trainNumber}:_ 🛫${departure.format(format)} 🛬${arrival.format(format)} ${delayOutput} ${loadOutput} ${reservedSeatOutput}\n`);
    });
    return response.join('');
};

const defaultListResponse = (type) => {
    return async (msg) => {
        const chatId = msg.chat.id;
        const allStations = await api.getAllStations();
        const date = new Date();
        const timeExecutor = TIME_REGEXP.exec(msg.text);
        const [, hour, min] = Array.isArray(timeExecutor) ? timeExecutor : [];

        let trains, userStationsGetter;

        const {message_id} = await sendMessage(chatId, 'Работаю...');

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
        bot.deleteMessage(chatId, message_id);
    };
}

// Matches "/домой"
bot.onText(/домой/i, defaultListResponse(DEST_TYPES.HOME));

// Matches "/работать"
bot.onText(/работать/i, defaultListResponse(DEST_TYPES.WORK));

module.exports = {bot};
