const { Markup } = require("telegraf");
const { Profit } = require("../database");
const paginateButtons = require("../helpers/paginateButtons");
const locale = require("../locale");

module.exports = async (ctx, page = 1) => {
  try {
    const profits = await Profit.paginate({
      pageIndex: parseInt(page),
      pageSize: 10,
      where: {
        userId: ctx.from.id,
      },
    });
    let profits_sum = parseFloat(await Profit.sum("convertedAmount", {
      where: {
        userId: ctx.from.id,
      },
    })).toFixed(2);
    profits_sum = typeof profits_sum == "number" ? profits_sum : 0;

    var buttons = profits.data.map((v) => [
      Markup.callbackButton(
        `${v.amount} ${v.currency} | ${v.serviceTitle}`,
        `my_profit_${v.id}`
      ),
    ]);

    if (buttons.length < 1)
      buttons = [[Markup.callbackButton("Страница пуста", "none")]];

    return ctx
      .replyOrEdit(`💰 <b>Список ваших профитов</b> (Всего: <b>${profits.meta.total}</b>, Общая сумма: <b>${profits_sum}</b> RUB)`, {
        reply_markup: Markup.inlineKeyboard([
          ...buttons,
          paginateButtons(profits.meta, "my_profits_"),
        ]),
        parse_mode: "HTML"
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
