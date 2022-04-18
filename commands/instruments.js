const { Markup } = require("telegraf");
const locale = require("../locale");

module.exports = async (ctx) => {
  return ctx
    .replyOrEdit(`🧰 <b>Инструменты:</b>`, {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton(locale.instruments.referral, "referral"),
          Markup.callbackButton(locale.instruments.mentors, "mentors"),
        ],
        [
          ...(ctx.state.user.status !== 0 && process.env.SMS_TOKEN
            ? 
              [
                Markup.callbackButton(
                  locale.instruments.send_sms,
                  "send_sms"
                ),
              ]
            : []),
          ...(ctx.state.user.status !== 0 && process.env.EMAIL_TOKEN
            ? 
              [
                Markup.callbackButton(
                  locale.instruments.send_email,
                  "send_email"
                ),
              ]
            : []),
        ],
        [
          Markup.callbackButton(locale.instruments.complaint, "complaint"),
        ],
        [
          Markup.callbackButton(locale.instruments.support, "support_inst"),
          Markup.callbackButton(locale.instruments.whatsapp, "whatsapp"),
        ],
        [
          Markup.callbackButton(
            ctx.state.user.hideNick
              ? "🟢 Показывать никнейм"
              : "🔴 Скрыть никнейм",
            `settings_nickname_${ctx.state.user.hideNick ? "show" : "hide"}`
          ),
        ],
        [
          Markup.callbackButton(
            "✏️ Изменить адрес USDT", "change_usdt_wallet"
          ),
        ],
      ]),
      parse_mode: "HTML",
    })
    .catch ((err) => ctx.reply("❌ Ошибка"));
};
