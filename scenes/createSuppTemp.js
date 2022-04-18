const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { SupportTemplate } = require("../database");

const scene = new WizardScene(
  "add_temp_supp",
  async (ctx) => {
    try {
      if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
      ctx.updateType = "message";
      await ctx.scene.reply("Введите название шаблона", {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        ctx.scene.state.data.title = ctx.message.text;
        await ctx.scene.reply("Введите текст шаблона", {
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
        });
        return ctx.wizard.next();
      } else {
        return ctx.wizard.prevStep();
      }
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (ctx.message?.text) {
        await SupportTemplate.create({
          userID: ctx.from.id,
          title: escapeHTML(ctx.scene.state.data.title),
          message: escapeHTML(ctx.message.text),
          countryCode: ctx.scene.state.countryCode,
        });
        await ctx.scene.reply("✅ Шаблон успешно создан", {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("📖 Шаблон", "get_temp_supp_" + ctx.scene.state.countryCode)],
          ]),
        });
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
