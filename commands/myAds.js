const { Markup } = require("telegraf");
const { Ad, User } = require("../database");
const paginateButtons = require("../helpers/paginateButtons");
const locale = require("../locale");

module.exports = async (ctx, page = 1) => {
  try {
    const user = await User.findByPk(ctx.from.id);
    if (!user.USDTWallet) {
      return ctx.replyOrEdit("❌ <b>Чтобы пользоваться этой функцией, вам необходимо установить адрес кошелька USDT (TRC-20) в инструментах</b>", {parse_mode: "HTML"})
    }

    const ads = await Ad.paginate({
      pageIndex: parseInt(page),
      pageSize: 10,
      where: {
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

    var buttons = ads.data.map((v) => [
      Markup.callbackButton(
        `${v.service.title} ${v.version}.0 | ${v.title}`,
        `my_ad_${v.id}`
      ),
    ]);

    if (buttons.length < 1)
      buttons = [[Markup.callbackButton("Страница пуста", "none")]];

    return ctx
      .replyOrEdit(`🛍 <b>Список ваших объявлений</b> (Всего: <b>${ads.meta.total}</b>)`, {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          paginateButtons(ads.meta, "my_ads_"),
          [
            Markup.callbackButton(
              "❌ Удалить все объявления",
              "delete_all_my_ads"
            ),
          ],
        ]),
        parse_mode: "HTML"
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
