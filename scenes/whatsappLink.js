const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const {  User } = require("../database");
const instruments = require("../commands/instruments");

const scene = new WizardScene(
  "whatsapp_link",
  async (ctx) => {
    try {
      await ctx.scene.reply(`📟 <b>Просто отправь мне номер телефона и я сгенерирую ссылку wa.me с номером</b>
      
📌 <i>Это команду так же можно вызвать просто написав</i> <b>/wa</b>`, {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
        parse_mode: "HTML"
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      if (ctx.message.text.trim().length < 5 || isNaN(ctx.message.text.trim()))
        return ctx.wizard.prevStep();
      
      let number = ctx.message.text.trim();
      if (number[0] == "+") {
        number = number.slice(1);
      }
      
      await ctx.scene.reply(`<b>https://wa.me/${number}</b>`, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
      return ctx.scene.leave();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
);

scene.leave(instruments);

module.exports = scene;
