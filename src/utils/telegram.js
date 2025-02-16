const axios = require("axios");

const sendTelegramMessage = async (bot, chatId, message) => {
  const url = `https://api.telegram.org/bot${bot}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Gagal mengirim pesan ke Telegram:", error.message);
  }
};

const sendTelegramMessageGroup = async (
  bot,
  chatId,
  message,
  threadId = null
) => {
  const url = `https://api.telegram.org/bot${bot}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      ...(threadId && { message_thread_id: threadId }),
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Gagal mengirim pesan ke Telegram:", error.message);
  }
};

module.exports = { sendTelegramMessage, sendTelegramMessageGroup };
