const { Markup } = require("telegraf");
const locale = require("../locale");

module.exports = async (ctx) => {
  return ctx
    .replyOrEdit(
      `📲 <b>Для отправки сообщения на почту, обратитесь к @your_mailer</b>`,
      {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton(locale.go_back, "instruments")],
        ]),
        parse_mode: "HTML",
      }
    )
    .catch((err) => ctx.reply("❌ Ошибка"));
};
