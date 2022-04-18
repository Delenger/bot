const { Markup } = require("telegraf");

module.exports = (bot, user, text, support, ad) => {
  if (user.mySupport) {
    bot
      .sendMessage(user.id, text, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "👁 Проверить онлайн",
              `support_check_${support.id}_online`
            ),
          ],
        ]),
      })
      .catch((err) => err);
    bot
      .sendMessage(
        user.mySupport,
        `👤 Воркер: <a href="tg://user?id=${user.id}">${user.username}</a>\n` +
          text,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "👁 Проверить онлайн",
                `support_check_${support.id}_online`
              ),
            ],
            [
              Markup.callbackButton(
                "✍️ Отправить сообщение в ТП",
                `support_${support.id}_send_message`
              ),
            ],
            [
              Markup.callbackButton(
                "📖 Шаблоны",
                `get_all_temp_country:${ad.service.countryCode}_sup:${support.id}`
              ),
            ],
          ]),
        }
      )
      .catch((err) => err);
  } else {
    bot
      .sendMessage(user.id, text, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "👁 Проверить онлайн",
              `support_check_${support.id}_online`
            ),
          ],
          [
            Markup.callbackButton(
              "✍️ Отправить сообщение в ТП",
              `support_${support.id}_send_message`
            ),
          ],
          [
            Markup.callbackButton(
              "📖 Шаблоны",
              `get_all_temp_country:${ad.service.countryCode}_sup:${support.id}`
            ),
          ],
        ]),
      })
      .catch((err) => err);
  }
};
