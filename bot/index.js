require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const api = require('../api/');
const user = require('../user/');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const getTrainsHomeForNow = async now => {
    return api.getTrainsForNow(now, user.getToHomeStations());
};

const getTrainsWorkForNow = async now => {
    return api.getTrainsForNow(now, user.getToWorkStations());
};

// Matches "/echo [whatever]"
bot.onText(/домой/i, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Работаю...');

    const trains = await getTrainsHomeForNow(Date.now());
    const allStations = await api.getAllStations();

    const { fromStation, toStation } = user.getToHomeStations();

    if (trains.length > 0) {
        bot.sendMessage(chatId,
            `из ${allStations[fromStation]} в ${allStations[toStation]}` +
            '\n' +
            `* ${trains.splice(0, 5).join('\n* ')}`);
    } else {
        bot.sendMessage(chatId, 'Чет не нашел ничего :(');
    }
});

// Matches "/echo [whatever]"
bot.onText(/работать/i, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Работаю...');

    const trains = await getTrainsWorkForNow(Date.now());
    const allStations = await api.getAllStations();

    const { fromStation, toStation } = user.getToWorkStations();

    if (trains.length > 0) {
        bot.sendMessage(chatId,
            `из ${allStations[fromStation]} в ${allStations[toStation]}` +
            '\n' +
            `* ${trains.splice(0, 5).join('\n* ')}`);
    } else {
        bot.sendMessage(chatId, 'Чет не нашел ничего :(');
    }
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});
