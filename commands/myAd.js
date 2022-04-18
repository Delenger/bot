const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const { Ad, User, ProDomain } = require("../database");
const locale = require("../locale");

module.exports = async (ctx, id) => {
  try {
    const user = await User.findByPk(ctx.from.id);
    if (!user.USDTWallet) {
      return ctx.replyOrEdit(
        "❌ <b>Чтобы пользоваться этой функцией, вам необходимо установить адрес кошелька USDT (TRC-20) в инструментах</b>",
        { parse_mode: "HTML" }
      );
    }

    const ad = await Ad.findOne({
      where: {
        id,
        userId: ctx.from.id,
      },
      include: [
        {
          association: "service",
          required: true,
          include: [
            {
              association: "country",
              required: true,
            },
          ],
        },
      ],
    });
    if (!ad)
      return ctx
        .replyOrEdit("❌ Объявление не найдено", {
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("🔙 Назад", "my_ads_1")]]),
        })
        .catch((err) => err);

    var text = locale.myAd.text;

    text = text
      .replace("{service}", `${ad.service.title} ${ad.version}.0`)
      .replace("{title}", escapeHTML(ad.title || "отсутствует"))
      .replace("{price}", escapeHTML(ad.price || "отсутствует"))
      .replace("{name}", escapeHTML(ad.name || "отсутствует"))
      .replace("{phone}", escapeHTML(ad.phone || "отсутствует"))
      .replace("{address}", escapeHTML(ad.address || "отсутствует"))
      .replace("{balanceChecker}", ad.balanceChecker ? "включен" : "выключен")
      .replace("{fakeLink}", `https://${ad.service.domain}/${ad.id}`)
      .replace("{refundLink}", `https://${ad.service.domain}/refund/${ad.id}`);

    if (user.status == 3 || user.status == 1) {
      const domain = await ProDomain.findOne({
        where: {
          serviceCode: ad.service.code,
          status: 1,
        },
      });
      if (domain) {
        text += "\n\n⚜️ PRO Домены:\n";
        text += `🔗 Получение оплаты: <b>https://${domain.domain}/${ad.id}</b>\n`;
        text += `🔗 Возврат: <b>https://${domain.domain}/refund/${ad.id}</b>`;
      }
    }

    return ctx
      .replyOrEdit(text, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              `${ad.balanceChecker ? "🔴 Выключить" : "🟢 Включить"} чекер баланса`,
              `my_ad_${ad.id}_turn_${ad.balanceChecker ? "off" : "on"}_balanceChecker`
            ),
          ],
          [Markup.callbackButton(`💰 Изменить цену`, `my_ad_${ad.id}_edit_price`)],
          [Markup.callbackButton(`❌ Удалить объявление`, `my_ad_${ad.id}_delete`)],
          [Markup.callbackButton("🔙 Назад", "my_ads_1")],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
