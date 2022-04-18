const { Markup } = require("telegraf");
const { Country } = require("../database");
const locale = require("../locale");

module.exports = async (ctx, with_buttons = true) => {
  try {
    if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
    const countries = await Country.findAll({
      order: [["id", "asc"]],
      include: [
        {
          association: "writers",
        },
      ],
    });

    var text = `<b>${locale.now_writers}\n</b>`;
    countries.map((v) => {
      text += `\n${v.title} — <b>`;
      if (v.writers.length < 1) text += "никто не вбивает";
      text += v.writers
        .map((d) => `<a href="https://t.me/${d.username}">${d.username}</a>`)
        .join(", ");
      text += "</b>";
    });
    return ctx.replyWithPhoto("https://i.pinimg.com/originals/d2/9b/37/d29b3763144901117f0482ebde80d455.png", {
      caption: text,
      parse_mode: "HTML",
      disable_notification: true,
      disable_web_page_preview: true,
      reply_markup: with_buttons
        ? Markup.inlineKeyboard([])
        : {},
      })
      .catch((err) => ctx.reply(text, {
        parse_mode: "HTML",
        disable_notification: true,
        disable_web_page_preview: true,
        reply_markup: with_buttons
          ? Markup.inlineKeyboard([])
          : {},
      }));
  } catch (err) {
    console.log(err)
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
