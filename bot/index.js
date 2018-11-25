require('dotenv').config();

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

const getTrainsHomeForNow = async now => {
    return api.getTrainsForNow(now, user.getToHomeStations());
};

const getTrainsWorkForNow = async now => {
    return api.getTrainsForNow(now, user.getToWorkStations());
};

// Matches "/домой"
bot.onText(/домой/i, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Работаю...');

    const trains = await getTrainsHomeForNow(Date.now());
    const allStations = await api.getAllStations();

    const { fromStation, toStation } = user.getToHomeStations();

    if (trains.length > 0) {
        bot.sendMessage(chatId,
            (allStations && `из ${allStations[fromStation]} в ${allStations[toStation]}`) +
            '\n' +
            `* ${trains.splice(0, 5).join('\n* ')}`);
    } else {
        bot.sendMessage(chatId, 'Чет не нашел ничего :(');
    }
});

// Matches "/работать"
bot.onText(/работать/i, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Работаю...');

    const trains = await getTrainsWorkForNow(Date.now());
    const allStations = await api.getAllStations();

    const { fromStation, toStation } = user.getToWorkStations();

    if (trains.length > 0) {
        bot.sendMessage(chatId,
            (allStations && `из ${allStations[fromStation]} в ${allStations[toStation]}`) +
            '\n' +
            `* ${trains.splice(0, 5).join('\n* ')}`);
    } else {
        bot.sendMessage(chatId, 'Чет не нашел ничего :(');
    }
});

module.exports = {bot};
