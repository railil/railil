require('dotenv').config();

const DEST_TYPES = {
  WORK: 'work',
  HOME: 'home',
};

const DEST_TYPES_MATCH_REGEXP = new RegExp(Object.values(DEST_TYPES).join('|'));
const TIME_REGEXP = /в (\d{2})[:.](\d{2})/i;

const TelegramBot = require('node-telegram-bot-api');
const {InlineKeyboard} = require('node-telegram-keyboard-wrapper');
const api = require('../api');
const user = require('../user');
const url = `https://${process.env.PUBLIC_URL}`;
const token = process.env.BOT_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';
const bot = new TelegramBot(token, !isProduction ? {polling: true} : {});

if (isProduction) {
  bot.setWebHook(`${url}/bot${token}`);
}

const sendMessage = (chatId, text, params) => {
  const _params = {parse_mode: 'Markdown', ...params};

  return bot.sendMessage(chatId, text, _params);
};

const getTrainsHome = async (date) => {
  return api.getTrainsByDate(date, user.getToHomeStations());
};

const getTrainsWork = async (date) => {
  return api.getTrainsByDate(date, user.getToWorkStations());
};

const getLoadIcon = (load) => {
  if (load >= 0.8) {
    return '👺';
  }
  if (load >= 0.7) {
    return '🤬';
  }
  if (load >= 0.6) {
    return '👿';
  }
  if (load >= 0.5) {
    return '😡';
  }
  if (load >= 0.4) {
    return '😮';
  }

  return '👻';
};

const formatListResponse = (trains, stations, fromStation, toStation) => {
  const format = 'HH:mm';
  const ik = new InlineKeyboard();
  const items = trains.splice(0, 8).map((train) => {
    const {hasReservedSeat, departure, arrival, trainNumber, delay, load} = train;
    const delayOutput = delay ? `💢${delay}` : '';
    const loadOutput = getLoadIcon(load);
    const reservedSeatOutput = hasReservedSeat ? '🎟' : '';

    return {
      text:
        `${departure.format(format)} ➡ ${arrival.format(format)} ${delayOutput} ${loadOutput} ${reservedSeatOutput}`,
      callback_data: `${trainNumber}|${departure.format(format)}`};
  });

  ik
      .addRow(...items.slice(0, 2))
      .addRow(...items.slice(2, 4))
      .addRow(...items.slice(4, 6));

  return [`🚂 *${stations[fromStation]}* ➡️ *${stations[toStation]}*`, ik.build()];
};

const defaultListResponse = (type) => {
  return async (msg) => {
    const chatId = msg.chat.id;
    const allStations = await api.getAllStations();
    const date = new Date();
    const timeExecutor = TIME_REGEXP.exec(msg.text);
    const [, hour, min] = Array.isArray(timeExecutor) ? timeExecutor : [];

    let trains; let userStationsGetter;

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
    const {fromStation, toStation} = userStationsGetter();

    if (trains.length > 0) {
      // sendMessage(chatId, formatListResponse(trains, allStations, fromStation, toStation));
      bot.sendMessage(chatId, ...formatListResponse(trains, allStations, fromStation, toStation));
    } else {
      sendMessage(chatId, 'Чет не нашел ничего :(');
    }
  };
};

// Matches "/домой"
bot.onText(/домой/i, defaultListResponse(DEST_TYPES.HOME));

// Matches "/работать"
bot.onText(/работать/i, defaultListResponse(DEST_TYPES.WORK));

bot.onText(/\/start/i, async (msg) =>{
  const ik = new InlineKeyboard();
  ik.addRow({text: 'домой', callback_data: DEST_TYPES.HOME}, {text: 'работать', callback_data: DEST_TYPES.WORK});
  bot.sendMessage(msg.chat.id, 'Куда ехать будем?', ik.build());
});

bot.on('callback_query', async (query) => {
  if (query.data.match(DEST_TYPES_MATCH_REGEXP)) {
    await bot.answerCallbackQuery(query.id, {text: `Работаю...`});
    defaultListResponse(query.data)(query.message);
  } else {
    const time = query.data.split('|')[1];
    await bot.answerCallbackQuery(query.id, {text: `Putting you on ${time}`});
    bot.sendMessage(query.message.chat.id, `${query.from.first_name} ${query.from.last_name} поедет на ${time}`);
  }
  bot.deleteMessage(query.message.chat.id, query.message.message_id);
});

module.exports = {bot};
