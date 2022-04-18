const { Markup } = require("telegraf");
const locale = require("../locale");

module.exports = async (ctx) => {
  return ctx
    .replyOrEdit(`🔩 <b>Настройки:</b>`, {
      // reply_markup: Markup.inlineKeyboard([
      //   [
      //     Markup.callbackButton(
      //       ctx.state.user.hideNick
      //         ? "🟢 Показывать никнейм"
      //         : "🔴 Скрыть никнейм",
      //       `settings_nickname_${ctx.state.user.hideNick ? "show" : "hide"}`
      //     ),
      //   ],
      //   [
      //     Markup.callbackButton(
      //       "✏️ Изменить адрес USDT", "change_usdt_wallet"
      //     ),
      //   ]
      // ]),
      parse_mode: "HTML",
    })
    .catch ((err) => ctx.reply("❌ Ошибка"));
};
