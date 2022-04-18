const { Markup } = require("telegraf");
const locale = require("../locale");

module.exports = async (ctx) => {
  return ctx
    .replyOrEdit(`📚 <b>Информация:</b>`, {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton(locale.mainMenu.buttons.writer, "writers"),
        ],
        [
          Markup.callbackButton(locale.mainMenu.buttons.chats, "chats"),
        ],
        [
          Markup.callbackButton(locale.instruments.kassa, "kassa"),
        ],
        [
          Markup.callbackButton(locale.mainMenu.buttons.workers_top, "workers_top"),
        ],
      ]),
      parse_mode: "HTML",
    })
    .catch ((err) => ctx.reply("❌ Ошибка"));
};
