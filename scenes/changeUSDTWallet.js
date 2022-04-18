const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const {  User } = require("../database");
const log = require("../helpers/log");
const instruments = require("../commands/instruments");

const scene = new WizardScene(
  "change_usdt_wallet",
  async (ctx) => {
    try {
      await ctx.scene.reply("🏷 <b>Введите адрес кошелька USDT (TRC-20)</b>", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
        parse_mode: "HTML"
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
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      if (!(ctx.message.text.trim().length === 34 && ctx.message.text.trim()[0] == "T"))
        return ctx.wizard.prevStep();

      const address = ctx.message.text.trim();
      const user = await User.findByPk(ctx.from.id);
      await user.update({
        USDTWallet: address,
      });
      await log(
        ctx,
        `изменил адрес USDT на <b>${address}</b>`
      );

      await ctx.scene.reply("✅ <b>Адрес USDT успешно изменён!</b>", {parse_mode: "HTML"});
      return ctx.scene.leave();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
);

scene.leave(instruments);

module.exports = scene;
