const { Markup } = require("telegraf");
const { Country, Service, User } = require("../database");
const chunk = require("chunk");
const locale = require("../locale");

module.exports = async (ctx, countryCode) => {
  try {
    const user = await User.findByPk(ctx.from.id);
    if (!user.USDTWallet) {
      return ctx.replyOrEdit("❌ <b>Чтобы пользоваться этой функцией, вам необходимо установить адрес кошелька USDT (TRC-20) в инструментах</b>", {parse_mode: "HTML"})
    }

    const services = await Service.findAll({
      where: {
        countryCode,
        status: 1,
      },
      order: [["title", "asc"]],
    });

    var buttons = chunk(
      services.map((v) =>
        Markup.callbackButton(v.title, `create_link_service_${v.code}`)
      )
    );
    if (buttons.length < 1)
      buttons = [[Markup.callbackButton("Страница пуста", "none")]];
    return ctx
      .replyOrEdit(`<b>${locale.choose_service}</b>`, {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          [Markup.callbackButton(locale.go_back, "create_link")],
        ]),
        parse_mode: "HTML"
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
