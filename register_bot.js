// -*- coding: utf-8 -*-
const axios = require('axios');
const http = require('http');

const BOT_TOKEN = process.env.REGISTER_BOT_TOKEN || '8704643171:AAG2nd5umGh6bl0S7cT6ekBz3q-FplJXCmg';
const NOTIFY_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8688064558:AAH4VCduJ3Aiv9rNtUT6hWBPIeMokFI_6Nw';
const NOTIFY_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-4806445324';
const SHEET_URL = process.env.SHEET_URL || 'https://script.google.com/macros/s/AKfycbwHVv0q9LzVL2tmS6Ye56UnC_2XiGsRAxlzAJEhncTiuj3jDtT8jNQRDDfLUxl-zC_v/exec';

const API = 'https://api.telegram.org/bot' + BOT_TOKEN;
const NOTIFY_API = 'https://api.telegram.org/bot' + BOT_TOKEN;

let offset = 0;
const state = {};

setInterval(function() {
  const now = Date.now();
  for (var userId in state) {
    if (state[userId] && state[userId].timestamp && now - state[userId].timestamp > 10 * 60 * 1000) {
      delete state[userId];
    }
  }
}, 10 * 60 * 1000);

const MSG = {
  welcome: '๐ <b>เธขเธดเธเธ”เธตเธ•เนเธญเธเธฃเธฑเธเธชเธนเน 72Clubhouse!\nWelcome to 72Clubhouse!</b>\n\nเธเธ”เธเธธเนเธกเธ”เนเธฒเธเธฅเนเธฒเธเน€เธเธทเนเธญเธฅเธเธ—เธฐเน€เธเธตเธขเธเนเธ”เนเน€เธฅเธขเธเธฃเธฑเธ\nClick the button below to register:',
  btn_register: 'เธฅเธเธ—เธฐเน€เธเธตเธขเธ / Register Now',
  step1: 'เธเธฑเนเธเธ•เธญเธเธ—เธตเน 1/4 | Step 1/4\n\nเธเธฃเธธเธ“เธฒเธเธฃเธญเธ <b>เธเธทเนเธญ-เธเธฒเธกเธชเธเธธเธฅ</b>\nPlease enter your <b>Full Name</b>:',
  step2: 'เธเธฑเนเธเธ•เธญเธเธ—เธตเน 2/4 | Step 2/4\n\nเธเธฃเธธเธ“เธฒเธเธฃเธญเธ <b>เน€เธเธญเธฃเนเนเธ—เธฃเธจเธฑเธเธ—เน</b>\nPlease enter your <b>Phone Number</b>:',
  step3: 'เธเธฑเนเธเธ•เธญเธเธ—เธตเน 3/4 | Step 3/4\n\nเธเธฃเธธเธ“เธฒเธเธฃเธญเธ <b>เธเธทเนเธญเธเธเธฒเธเธฒเธฃ เนเธฅเธฐเน€เธฅเธเธเธฑเธเธเธต</b>\nPlease enter your <b>Bank Name and Account Number</b>:\nเธ•เธฑเธงเธญเธขเนเธฒเธ / Example: Kasikorn 123-4-56789-0',
  step4: 'เธเธฑเนเธเธ•เธญเธเธ—เธตเน 4/4 | Step 4/4\n\nเธเธฃเธธเธ“เธฒเธเธฃเธญเธ <b>Club GG ID</b> เธเธญเธเธเธธเธ“\nPlease enter your <b>Club GG ID</b>:',
  rematch_step: '๐ฎ <b>เธเธฑเนเธเธ•เธญเธเธชเธธเธ”เธ—เนเธฒเธข! / Last Step!</b>\n\nเน€เธเธทเนเธญเนเธซเนเธฃเธฐเธเธเธชเธฒเธกเธฒเธฃเธ–เธ•เธดเธ”เธ•เนเธญเธเธธเธ“เนเธ”เน เธเธฃเธธเธ“เธฒเธเธ”เธเธธเนเธกเธ”เนเธฒเธเธฅเนเธฒเธเน€เธเธทเนเธญเน€เธเธดเธ”เนเธเนเธเธฒเธ Rematch Bot เธเธฃเธฑเธ\nTo allow our system to contact you, please click the button below to activate the Rematch Bot.',
  done: 'โ… <b>เธฅเธเธ—เธฐเน€เธเธตเธขเธเธชเธณเน€เธฃเนเธเนเธฅเนเธง! / Registration Complete!</b>\n\nเธเธฃเธธเธ“เธฒเนเธเนเธเนเธญเธ”เธกเธดเธเน€เธเธทเนเธญเธขเธทเธเธขเธฑเธเธเธฒเธฃเธฅเธเธ—เธฐเน€เธเธตเธขเธเธเธญเธเธเธธเธ“เธเธฃเธฑเธ\nPlease contact admin to confirm your registration.\n\n๐‘ค @clubhouse72',
};

function formatClubGG(id) {
  var digits = id.replace(/[^0-9]/g, '');
  if (digits.length === 8) {
    return digits.slice(0,4) + '-' + digits.slice(4);
  }
  return id;
}

function formatPhone(phone) {
  var digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
  }
  return phone;
}

function formatBankAccount(input) {
  var parts = input.trim().split(' ');
  var bankName = '';
  var digits = '';
  for (var i = 0; i < parts.length; i++) {
    var d = parts[i].replace(/[^0-9]/g, '');
    if (d.length > 3) { digits += d; }
    else if (parts[i].replace(/[^0-9]/g, '').length === 0) { bankName += (bankName ? ' ' : '') + parts[i]; }
    else { digits += d; }
  }
  var len = digits.length;
  var formatted = '';
  if (len === 10) { formatted = digits.slice(0,3)+'-'+digits.slice(3,4)+'-'+digits.slice(4,9)+'-'+digits.slice(9); }
  else if (len === 11) { formatted = digits.slice(0,3)+'-'+digits.slice(3,6)+'-'+digits.slice(6,10)+'-'+digits.slice(10); }
  else if (len === 12) { formatted = digits.slice(0,3)+'-'+digits.slice(3,10)+'-'+digits.slice(10); }
  else if (len === 15) { formatted = digits.slice(0,3)+'-'+digits.slice(3,8)+'-'+digits.slice(8,13)+'-'+digits.slice(13); }
  else { return input; }
  return bankName ? bankName + ' ' + formatted : formatted;
}

async function send(chatId, text, keyboard) {
  const payload = { chat_id: chatId, text: text, parse_mode: 'HTML' };
  if (keyboard) payload.reply_markup = { inline_keyboard: keyboard };
  try {
    await axios.post(API + '/sendMessage', payload);
  } catch(e) {
    console.error('Send error:', e.message);
  }
}

async function notifyAdmin(text) {
  try {
    await axios.post(NOTIFY_API + '/sendMessage', {
      chat_id: NOTIFY_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    });
  } catch(e) {
    console.error('Notify error:', e.message);
  }
}

async function saveSheet(data) {
  try {
    await axios.post(SHEET_URL, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch(e) {
    console.error('Sheet error:', e.message);
  }
}

async function handleUpdate(update) {
  if (update.message) {
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const text = update.message.text || '';
    if (update.message.chat.type !== 'private') return;

    if (state[userId]) {
      const s = state[userId];

      if (s.step === 'name') {
        s.name = text;
        s.step = 'phone';
        await send(chatId, MSG.step2, null);

      } else if (s.step === 'phone') {
        s.phone = text;
        s.step = 'bank';
        await send(chatId, MSG.step3, null);

      } else if (s.step === 'bank') {
        s.bank = text;
        s.step = 'clubgg';
        await send(chatId, MSG.step4, null);

      } else if (s.step === 'clubgg') {
        s.clubgg_id = text;

        s.phone = formatPhone(s.phone);
        s.bank = formatBankAccount(s.bank);
        s.clubgg_id = formatClubGG(s.clubgg_id);

        await saveSheet({
          name: s.name,
          phone: s.phone,
          bank: s.bank,
          clubgg_id: s.clubgg_id,
          telegram_id: '@' + (update.message.from.username || userId),
        });

        await notifyAdmin(
          '๐• <b>New Member!</b>\n\n' +
          '๐‘ค Name: ' + s.name + '\n' +
          '๐“ Phone: ' + s.phone + '\n' +
          '๐ฆ Bank: ' + s.bank + '\n' +
          '๐ฎ Club GG ID: ' + s.clubgg_id + '\n' +
          '๐“ฑ Telegram: @' + (update.message.from.username || userId)
        );

        s.step = 'rematch';

        await send(chatId, MSG.rematch_step, [
          [{ text: '๐ฎ เน€เธเธดเธ”เนเธเนเธเธฒเธ Rematch Bot / Activate Rematch Bot', url: 'https://t.me/clubhouse72_rematch_bot?start=register' }],
          [{ text: 'โ… เธเธ”เนเธฅเนเธง / I have activated', callback_data: 'rematch_done' }]
        ]);
      }
      return;
    }

    if (text === '/start') {
      delete state[userId];
      await send(chatId, MSG.welcome,
        [[{ text: MSG.btn_register, callback_data: 'register' }]]
      );
    }
  }

  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const userId = update.callback_query.from.id;
    const data = update.callback_query.data;
    await axios.post(API + '/answerCallbackQuery', {
      callback_query_id: update.callback_query.id
    }).catch(function(){});

    if (data === 'rematch_done') {
      if (state[userId] && state[userId].step === 'rematch') {
        delete state[userId];
      }
      await send(chatId, MSG.done, null);

    } else if (data === 'register') {
      state[userId] = { step: 'name', timestamp: Date.now() };
      await send(chatId, MSG.step1, null);
    }
  }
}

async function poll() {
  try {
    const res = await axios.get(API + '/getUpdates', {
      params: { offset: offset, timeout: 30 },
      timeout: 35000,
    });
    const updates = res.data.result || [];
    for (var i = 0; i < updates.length; i++) {
      offset = updates[i].update_id + 1;
      await handleUpdate(updates[i]);
    }
  } catch(e) {
    console.error('Poll error:', e.message);
  }
  setTimeout(poll, 1000);
}

const PORT = process.env.PORT || 3000;
http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Register Bot running');
}).listen(PORT, function() {
  console.log('Server listening on port ' + PORT);
});

console.log('Register Bot starting...');
poll();
