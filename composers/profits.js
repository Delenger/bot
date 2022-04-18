const { Composer } = require("telegraf");
const { Profit } = require("../database");
const myProfits = require("../commands/myProfits");
const myProfit = require("../commands/myProfit");
const workersTop = require("../commands/workersTop");
const moment = require("moment");
const { Op } = require("sequelize");
const locale = require("../locale");

const composer = new Composer();

composer.hears(locale.mainMenu.buttons.workers_top, workersTop);

composer.hears(locale.mainMenu.buttons.my_profits, (ctx) => myProfits(ctx, 1));

composer.hears(/Топ|Топ воркеров|Топ профитов/giu, workersTop);

composer.command("top", workersTop);

composer.command("kassa", async (ctx) => {
  try {
    let kassa = await Profit.sum("convertedAmount"),
      kassa_today = await Profit.sum("convertedAmount", {
        where: {
          createdAt: {
            [Op.gte]: moment().startOf("day").toDate(),
          },
        },
      });

    kassa = !kassa ? 0 : kassa;
    kassa_today = !kassa_today ? 0 : kassa_today;

    return ctx.replyWithPhoto("https://i.pinimg.com/originals/dc/4c/31/dc4c31949911d1bd73db390bb62641c2.jpg",
        {
          caption: `💰 Сегодняшняя касса: <b>${parseFloat(kassa_today).toFixed(2)} RUB</b>`,
          parse_mode: "HTML",
        }
      )
      .catch((err) => ctx.reply(
        // 💸 Касса за всё время: <b>${parseFloat(kassa).toFixed(2)} RUB</b>
        `💰 Сегодняшняя касса: <b>${parseFloat(kassa_today).toFixed(2)} RUB</b>`,
        {
          parse_mode: "HTML",
        }
      ));
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

composer.action("kassa", async (ctx) => {
  try {
    if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
    let kassa = await Profit.sum("convertedAmount"),
      kassa_today = await Profit.sum("convertedAmount", {
        where: {
          createdAt: {
            [Op.gte]: moment().startOf("day").toDate(),
          },
        },
      });

    kassa = !kassa ? 0 : kassa;
    kassa_today = !kassa_today ? 0 : kassa_today;

    return ctx.replyWithPhoto("https://i.pinimg.com/originals/dc/4c/31/dc4c31949911d1bd73db390bb62641c2.jpg",
      {
        caption: `💰 Сегодняшняя касса: <b>${parseFloat(kassa_today).toFixed(2)} RUB</b>`,
        parse_mode: "HTML",
      }
    )
    .catch((err) => ctx.reply(
      // 💸 Касса за всё время: <b>${parseFloat(kassa).toFixed(2)} RUB</b>
      `💰 Сегодняшняя касса: <b>${parseFloat(kassa_today).toFixed(2)} RUB</b>`,
      {
        parse_mode: "HTML",
      }
    ));
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

composer.action("workers_top", workersTop);

composer.action(/^my_profits_(\d+)$/, (ctx) => myProfits(ctx, ctx.match[1]));

composer.action(/^my_profit_(\d+)$/, (ctx) => myProfit(ctx, ctx.match[1]));

module.exports = composer;
