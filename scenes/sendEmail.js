const WizardScene = require("telegraf/scenes/wizard");
const linkify = require("linkifyjs");
const { Markup } = require("telegraf");
const { Service } = require("../database");
const { default: axios } = require("axios");
const menu = require("../commands/menu");
const escapeHTML = require("escape-html");
const log = require("../helpers/log");
const locale = require("../locale.js");

const scene = new WizardScene(
  "send_email",
  async (ctx) => {
    try {
      if (ctx.state.user.status == 0) {
        await ctx.reply("❌ Для отправки смс Вы должны быть ПРО воркером").catch((err) => err);
        return ctx.scene.leave();
      }
      await ctx.scene.reply("Введите номер телефона человека", {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
      });
      ctx.scene.state.data = {};
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  // .....
);

scene.leave(menu);

module.exports = scene;
