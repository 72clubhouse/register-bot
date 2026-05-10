const axios = require('axios');

const BOT_TOKEN = process.env.REGISTER_BOT_TOKEN || '8704643171:AAG2nd5umGh6bl0S7cT6ekBz3q-FplJXCmg';
const NOTIFY_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8688064558:AAH4VCduJ3Aiv9rNtUT6hWBPIeMokFI_6Nw';
const NOTIFY_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003705394096';
const SHEET_URL = process.env.SHEET_URL || 'https://script.google.com/macros/s/AKfycbwHVv0q9LzVL2tmS6Ye56UnC_2XiGsRAxlzAJEhncTiuj3jDtT8jNQRDDfLUxl-zC_v/exec';

const API = 'https://api.telegram.org/bot' + BOT_TOKEN;
const NOTIFY_API = 'https://api.telegram.org/bot' + NOTIFY_TOKEN;

let offset = 0;
const state = {};

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
        await send(chatId, '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 2/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>\u0e40\u0e1a\u0e2d\u0e23\u0e4c\u0e42\u0e17\u0e23\u0e28\u0e31\u0e1e\u0e17\u0e4c</b> \u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13:', null);

      } else if (s.step === 'phone') {
        s.phone = text;
        s.step = 'bank';
        await send(chatId, '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 3/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>\u0e0a\u0e37\u0e48\u0e2d\u0e18\u0e19\u0e32\u0e04\u0e32\u0e23 \u0e41\u0e25\u0e30\u0e40\u0e25\u0e02\u0e1a\u0e31\u0e0d\u0e0a\u0e35</b>:\n\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07: \u0e01\u0e2a\u0e34\u0e01\u0e23 123-4-56789-0', null);

      } else if (s.step === 'bank') {
        s.bank = text;
        s.step = 'clubgg';
        await send(chatId, '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 4/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>Club GG ID</b> \u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13:', null);

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
          '🆕 <b>New Member!</b>\n\n' +
          '👤 Name: ' + s.name + '\n' +
          '📞 Phone: ' + s.phone + '\n' +
          '🏦 Bank: ' + s.bank + '\n' +
          '🎮 Club GG ID: ' + s.clubgg_id + '\n' +
          '📱 Telegram: @' + (update.message.from.username || userId)
        );

        delete state[userId];

        await send(chatId,
          '\u2705 <b>\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08\u0e41\u0e25\u0e49\u0e27!</b>\n\n\u0e41\u0e2d\u0e14\u0e21\u0e34\u0e19\u0e08\u0e30\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e01\u0e25\u0e31\u0e1a\u0e43\u0e19\u0e40\u0e23\u0e47\u0e27\u0e46 \u0e19\u0e35\u0e49\u0e04\u0e23\u0e31\u0e1a\u0e04\u0e23\u0e31\u0e1a\n\n👤 @clubhouse72',
          [[{ text: '\u0e01\u0e25\u0e31\u0e1a\u0e2b\u0e19\u0e49\u0e32\u0e2b\u0e25\u0e31\u0e01', callback_data: 'back' }]]
        );
      }
      return;
    }

    if (text === '/start') {
      await send(chatId,
        '🃏 <b>\u0e22\u0e34\u0e19\u0e14\u0e35\u0e15\u0e49\u0e2d\u0e19\u0e23\u0e31\u0e1a\u0e2a\u0e39\u0e48 72Clubhouse!</b>\n\n\u0e01\u0e14\u0e1b\u0e38\u0e48\u0e21\u0e14\u0e49\u0e32\u0e19\u0e25\u0e48\u0e32\u0e07\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e44\u0e14\u0e49\u0e40\u0e25\u0e22\u0e04\u0e23\u0e31\u0e1a:',
        [[{ text: '\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e40\u0e25\u0e22', callback_data: 'register' }]]
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
      state[userId] = { step: 'name' };
      await send(chatId, '\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 1/4\n\n\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01 <b>\u0e0a\u0e37\u0e48\u0e2d-\u0e19\u0e32\u0e21\u0e2a\u0e01\u0e38\u0e25</b> \u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13:', null);

    } else if (data === 'back') {
      await send(chatId,
        '🃏 <b>\u0e22\u0e34\u0e19\u0e14\u0e35\u0e15\u0e49\u0e2d\u0e19\u0e23\u0e31\u0e1a\u0e2a\u0e39\u0e48 72Clubhouse!</b>\n\n\u0e01\u0e14\u0e1b\u0e38\u0e48\u0e21\u0e14\u0e49\u0e32\u0e19\u0e25\u0e48\u0e32\u0e07\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19:',
        [[{ text: '\u0e25\u0e07\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e40\u0e25\u0e22', callback_data: 'register' }]]
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

console.log('Register Bot starting...');
poll();
