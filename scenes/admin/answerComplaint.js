const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const { Complaint, Settings } = require("../../database");

const scene = new WizardScene(
  "admin_answer_complaint",
  async (ctx) => {
    try {
      await ctx.reply("✏️ <b>Введите ответ на сообщение:</b>", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
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
      const answer = ctx.message.text.trim();
      const settings = await Settings.findByPk(1);
      const complaint = await Complaint.findByPk(ctx.scene.state.id);

      await complaint.update({
        isSolved: true,
      });
      await ctx.telegram.editMessageText(
        settings.logsGroupId,
        complaint.channelMessageId,
        complaint.channelMessageId,
        `📬 <b>Новая жалоба/вопрос #${complaint.id}</b>

🔑 <b>ID:</b> ${complaint.id}
👨‍💻 <b>От:</b> <b><a href="tg://user?id=${complaint.userId}">${complaint.username}</a></b> <code>(ID: ${complaint.userId})</code>
📝 <b>Текст:</b> ${complaint.text}
📖 <b>Ответ:</b> ${answer}
<b>Статус:</b> ✅ Решён`, {
  parse_mode: "HTML"
}
      );
      await ctx.telegram.sendMessage(complaint.userId,
        `⚠️ <b>На вашу жалобу/вопрос пришёл ответ от администрации:</b>
${answer}`, {
        parse_mode: "HTML",
      })
      await ctx.scene.reply("✅ <b>Ответ успешно отослан пользователю!</b>", {
        parse_mode: "HTML"
      });
    } catch (err) {
      console.log(err)
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

module.exports = scene;
