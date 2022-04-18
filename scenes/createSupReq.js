const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { SupportUser } = require("../database");
const log = require("../helpers/log");

const scene = new WizardScene(
  "create_supp_anket",
  async (ctx) => {
    try {
        await ctx.scene.reply("📑 <b>Введите описание</b>", {
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
          parse_mode: "HTML",
        });
        return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        const anket = await SupportUser.create({
          userId: ctx.from.id,
          username: ctx.from.username,
          text: escapeHTML(ctx.message.text),
        });

        await ctx.scene.reply("✅ <b>Анкета успешно создана!</b>", {parse_mode: "HTML"});
        await log(ctx, `создал новую анкету поддержки <b>#${anket.id}</b>
📝 <b>Описание:</b>
${anket.text}`);
      } else {
        return ctx.wizard.prevStep();
      }
    } catch (err) {
      console.log(err);
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave((ctx) => ctx.updateType == "callback_query" && ctx.deleteMessage().catch((err) => err));

module.exports = scene;
