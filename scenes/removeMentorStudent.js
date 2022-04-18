const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const mentorAnket = require("../commands/mentorAnket");
const menu = require("../commands/menu");
const { Mentor, User } = require("../database");
const log = require("../helpers/log");
const { Op } = require("sequelize");

const scene = new WizardScene(
  "remove_mentor_student",
  async (ctx) => {
    try {
      if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
      ctx.updateType = "message";

      await ctx.scene.reply("✏️ <b>Введите логин либо id ученика</b>", {
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
        const text = ctx.message?.text.trim().toLowerCase().replace("@", "");

        const student = await User.findOne({
          where: {
            [Op.or]: [
              {
                username: text,
              },
              {
                id: text,
              },
            ],
          },
        });
        if (student) {
          await student.update({
            myMentor: null,
          });
          await ctx.scene.reply("✅ <b>Ученик успешно удален!</b>", { parse_mode: "HTML" });
        } else {
          await ctx.scene.reply("❌ <b>Ученик не найден!</b>", { parse_mode: "HTML" });
        }
        await mentorAnket(ctx,  ctx.scene.state.anketId, true);
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
