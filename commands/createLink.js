const { Markup } = require("telegraf");
const { Country, User} = require("../database");
const chunk = require("chunk");
const locale = require("../locale");

module.exports = async (ctx) => {
  try {
    const user = await User.findByPk(ctx.from.id);
    if (!user.USDTWallet) {
      return ctx.replyOrEdit("❌ <b>Чтобы пользоваться этой функцией, вам необходимо установить адрес кошелька USDT (TRC-20) в инструментах</b>", {parse_mode: "HTML"})
    }

    const countries = await Country.findAll({
      order: [["id", "asc"]],
      where: {
        status: 1,
      },
    });

    return ctx
      .replyOrEdit(`<b>${locale.choose_country}</b>`, {
        reply_markup: Markup.inlineKeyboard([
          ...chunk(
            countries.map((v) =>
              Markup.callbackButton(v.title, `create_link_${v.id}`)
            )
          ),
        ]),
        parse_mode: "HTML"
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
