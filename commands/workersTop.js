const { Markup } = require("telegraf");
const { User } = require("../database");
const { Sequelize } = require("../models");

module.exports = async (ctx) => {
  try {
    if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
    const users = await User.findAll({
      subQuery: false,
      attributes: {
        include: [
          [
            Sequelize.fn("SUM", Sequelize.col("profits.convertedAmount")),
            "totalProfits",
          ],
        ],
      },
      include: [
        {
          association: "profits",
          attributes: [],
          required: true,
        },
      ],
      group: ["User.id"],
      order: [[Sequelize.literal("totalProfits"), "desc"]],
      limit: 10,
    });
    var text = users
      .map(
        (v) =>
          `<b>${
            v.hideNick
              ? "Скрыт"
              : `<a href="tg://user?id=${v.id}">${v.username}</a>`
          } — 💰 ${parseFloat(v.getDataValue("totalProfits")).toFixed(
            2
          )} RUB</b>`
      )
      .join("\n");
    if (users.length < 1) text = "🔍 В топе ещё никого нету";
    return ctx.replyWithPhoto("https://i.pinimg.com/originals/dc/4c/31/dc4c31949911d1bd73db390bb62641c2.jpg", {
          caption: `<b>🏆 Топ воркеров</b>
     
${text}`,
          parse_mode: "HTML",
          disable_notification: true,
          disable_web_page_preview: true,
        }
      )
      .catch((err) => ctx.reply(
        `<b>🏆 Топ воркеров</b>
     
${text}`,
        {
          parse_mode: "HTML",
          disable_notification: true,
          disable_web_page_preview: true,
        }
      ));
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
