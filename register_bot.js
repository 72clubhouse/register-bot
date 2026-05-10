const axios = require('axios');
const http = require('http');

const BOT_TOKEN = process.env.REGISTER_BOT_TOKEN || '8704643171:AAG2nd5umGh6bl0S7cT6ekBz3q-FplJXCmg';
const NOTIFY_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-4806445324';
const SHEET_URL = process.env.SHEET_URL || 'https://script.google.com/macros/s/AKfycbwHVv0q9LzVL2tmS6Ye56UnC_2XiGsRAxlzAJEhncTiuj3jDtT8jNQRDDfLUxl-zC_v/exec';

const API = 'https://api.telegram.org/bot' + BOT_TOKEN;
const NOTIFY_API = 'https://api.telegram.org/bot' + BOT_TOKEN;

let offset = 0;
const state = {};

// Clear expired states every 10 minutes (30 min timeout)
setInterval(function() {
  const now = Date.now();
  for (var userId in state) {
    if (state[userId] && state[userId].timestamp && now - state[userId].timestamp > 10 * 60 * 1000) {
      delete state[userId];
    }
  }
}, 10 * 60 * 1000);

const MSG = {
  welcome: '\u{1F0CF} <b>\u0e22\u0e34\u0e19\u0e14\u0e35\u0e15\u0e49\u0e2d\u0e19\u0e23\u0e31\u0e1a\u0e2a\u0e39\u0e48 72Clubhouse!\nWelcome to 72Clubhouse!</b>\n\n\u0e01\u0e14\u0e1b\u0e38\u0e48\u0e21\u0e14\u0e49\u0e32\u0e19\u0e25\u0e48\u0e32\u0e07\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e44\u0e14\u0e49\u0e40\u0e25\u0e22\u0e04\u0e23\u0e31\u0e1a\nClick the button below to register:',
  btn_register: '\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19 / Register Now',
  btn_back: '\u0e01\u0e25\u0e31\u0e1a / Back',
  step1: '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 1/4 | Step 1/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>\u0e0a\u0e37\u0e48\u0e2d-\u0e19\u0e32\u0e21\u0e2a\u0e01\u0e38\u0e25</b>\nPlease enter your <b>Full Name</b>:',
  step2: '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 2/4 | Step 2/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>\u0e40\u0e1a\u0e2d\u0e23\u0e4c\u0e42\u0e17\u0e23\u0e28\u0e31\u0e1e\u0e17\u0e4c</b>\nPlease enter your <b>Phone Number</b>:',
  step3: '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 3/4 | Step 3/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>\u0e0a\u0e37\u0e48\u0e2d\u0e18\u0e19\u0e32\u0e04\u0e32\u0e23 \u0e41\u0e25\u0e30\u0e40\u0e25\u0e02\u0e1a\u0e31\u0e0d\u0e0a\u0e35</b>\nPlease enter your <b>Bank Name and Account Number</b>:\n\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07 / Example: Kasikorn 123-4-56789-0',
  step4: '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 4/4 | Step 4/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>Club GG ID</b> \u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\nPlease enter your <b>Club GG ID</b>:',
  done: '\u2705 <b>\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08\u0e41\u0e25\u0e49\u0e27! / Registration Complete!</b>\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e41\u0e08\u0e49\u0e07\u0e41\u0e2d\u0e14\u0e21\u0e34\u0e19\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e01\u0e32\u0e23\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e04\u0e23\u0e31\u0e1a\nPlease contact admin to confirm your registration.\n\n\u{1F464} @clubhouse72',
};

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

        await saveSheet({
          name: s.name,
          phone: s.phone,
          bank: s.bank,
          clubgg_id: s.clubgg_id,
          telegram_id: '@' + (update.message.from.username || userId),
        });

        await notifyAdmin(
          '\u{1F195} <b>New Member!</b>\n\n' +
          '\u{1F464} Name: ' + s.name + '\n' +
          '\u{1F4DE} Phone: ' + s.phone + '\n' +
          '\u{1F3E6} Bank: ' + s.bank + '\n' +
          '\u{1F3AE} Club GG ID: ' + s.clubgg_id + '\n' +
          '\u{1F4F1} Telegram: @' + (update.message.from.username || userId)
        );

        delete state[userId];

        await send(chatId, MSG.done,
          [[{ text: MSG.btn_back, callback_data: 'back' }]]
        );
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

    if (data === 'register') {
      state[userId] = { step: 'name', timestamp: Date.now() };
      await send(chatId, MSG.step1, null);

    } else if (data === 'back') {
      delete state[userId];
      await send(chatId, MSG.welcome,
        [[{ text: MSG.btn_register, callback_data: 'register' }]]
      );
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
