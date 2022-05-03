const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const mentorAnket = require("../commands/mentorAnket");
const menu = require("../commands/menu");
const { Mentor, User } = require("../database");
const log = require("../helpers/log");

const scene = new WizardScene(
  "change_mentor",
  async (ctx) => {
    try {
      if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
      ctx.updateType = "message";

      await ctx.scene.reply("🏷 <b>Введите логин наставника</b>", {
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
        const text = ctx.message?.text.trim().toLowerCase();

        // if (text == "удалить") {
        //   var user = await User.findByPk(ctx.scene.state.workerId);
        //   await user.update({
        //     myMentor: null,
        //   });
        //   await ctx.reply("✅ <b>Наставник успешно удален!</b>", {parse_mode: "HTML"});
        //   return ctx.scene.leave();
        // }

        let mentorUsername;
        if (text[0] == "@") {
          mentorUsername = escapeHTML(text.slice(1));
        } else {
          mentorUsername = escapeHTML(text);
        }

        const mentor = await Mentor.findOne({
          where: {
            username: mentorUsername,
          },
        });

        if (mentor && mentor?.userId != ctx.scene.state.workerId) {
          var user = await User.findByPk(ctx.scene.state.workerId);
          await user.update({
            myMentor: mentor.userId,
          });
        } else if (mentor?.userId === ctx.scene.state.workerId) {
          await ctx.reply("❌ <b>Вы не можете стать наставником самому себе!</b>", { parse_mode: "HTML" });
          return ctx.wizard.prevStep();
        } else {
          await ctx.reply("❌ <b>Такого наставника нет!</b>", { parse_mode: "HTML" });
          return ctx.wizard.prevStep();
        }

        await ctx.scene.reply("✅ <b>Вы успешно выбрали наставника!</b>", { parse_mode: "HTML" });
        await ctx.telegram.sendMessage(mentor.userId, `🎉 <b>У вас новый ученик — @${ctx.state.user.username}</b>\n<i>Напиши ему в лс и добавь в свой чат</i>`, {
          parse_mode: "HTML",
        });
        await log(ctx, `стал учеником для наставника <b>@${mentor.username}</b>`);
      } else {
        return ctx.wizard.prevStep();
      }
    } catch (err) {
      console.log(err)
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave((ctx) => ctx.updateType == "callback_query" && ctx.deleteMessage().catch((err) => err));

module.exports = scene;
