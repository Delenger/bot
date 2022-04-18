const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { SupportChat } = require("../database");
const download = require("download");
const fs = require("fs");

const scene = new WizardScene(
  "support_send_message",
  async (ctx) => {
    try {
      if (ctx.updateType == "callback_query") await ctx.answerCbQuery().catch((err) => err);
      ctx.updateType = "message";
      await ctx.scene.reply("Введите сообщение или отправьте фото", {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
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
        await SupportChat.create({
          messageFrom: 0,
          supportId: ctx.scene.state.supportId,
          message: escapeHTML(ctx.message.text),
          messageId: ctx.message.message_id,
        });

        await ctx.scene
          .reply("✅ Сообщение отправлено!", {
            reply_to_message_id: ctx.message.message_id,
          })
          .catch((err) => err);
      } else if (ctx.message?.photo) {
        var photo = await ctx.telegram.getFileLink(ctx.message.photo[ctx.message.photo.length - 1]);
        var photo_path = new Date().getTime() + ".jpg";
        fs.writeFileSync("./web/uploads/" + photo_path, await download(photo));
        await SupportChat.create({
          messageFrom: 0,
          supportId: ctx.scene.state.supportId,
          message: `fi29304fj340fj3d923hd7984 ${photo_path}`,
          messageId: ctx.message.message_id,
        });
        await ctx.scene
          .reply("✅ Фотография отправлена!", {
            reply_to_message_id: ctx.message.message_id,
          })
          .catch((err) => err);
      } else {
        return ctx.wizard.prevStep();
      }
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave((ctx) => ctx.updateType == "callback_query" && ctx.deleteMessage().catch((err) => err));

module.exports = scene;
