const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const mentorAnket = require("../commands/mentorAnket");
const { Mentor } = require("../database");
const log = require("../helpers/log");

const scene = new WizardScene(
  "create_mentor_anket",
  async (ctx) => {
    try {
      if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
      ctx.updateType = "message";

      await ctx.scene.reply("🌍 <b>Введите страны/сервисы, по которым вы будете обучать</b>", {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
        parse_mode: "HTML",
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
        ctx.scene.state.data.countries = ctx.message.text;

        await ctx.scene.reply("📑 <b>Введите описание</b>", {
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
          parse_mode: "HTML",
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
        const anket = await Mentor.create({
          userId: ctx.from.id,
          username: ctx.from.username,
          countries: escapeHTML(ctx.scene.state.data.countries),
          text: escapeHTML(ctx.message.text),
        });

        await ctx.scene.reply("✅ <b>Анкета успешно создана!</b>", {parse_mode: "HTML"});
        await log(ctx, `создал новую анкету наставника <b>#${anket.id}</b>
🌍 <b>Страны:</b> ${anket.countries}
📝 <b>Описание:</b>
${anket.text}`);
        await mentorAnket(ctx, anket.id, true);
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
