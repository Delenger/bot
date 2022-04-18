const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = require("telegraf");
const { Settings, Complaint } = require("../database");
const instruments = require("../commands/instruments");

const scene = new WizardScene(
  "complaint",
  async (ctx) => {
    try {
      await ctx.scene.reply("📚 <b>Детально опишите жалобу, вопрос или предложение</b>\n\n⏳ <i>Ваша заявка будет рассмотрена администрацией в ближайшее время</i>", {
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
      if (ctx.message.text.trim().length < 5)
        return ctx.wizard.prevStep();

      const text = ctx.message.text.trim();
      const settings = await Settings.findByPk(1);

      const complaint = await Complaint.create({
        userId: ctx.from.id,
        username: ctx.from.username,
        text: text,
      });

      const msg = await ctx.telegram.sendMessage(settings.logsGroupId,
        `📬 <b>Новая жалоба/вопрос #${complaint.id}</b>

🔑 <b>ID:</b> ${complaint.id}
👨‍💻 <b>От:</b> <b><a href="tg://user?id=${ctx.from.id}">${ctx.state.user.username}</a></b> <code>(ID: ${ctx.from.id})</code>
📝 <b>Текст:</b> ${text}
<b>Статус:</b> ❌ Не решён`, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "✏️ Ответить",
                `admin_answer_complaint_${complaint.id}`
              ),
            ],
          ]),
        }
      );

      await complaint.update({
        channelMessageId: msg.message_id,
      });

      await ctx.scene.reply("✅ <b>Заявка успешно оставлена. Ответ от администрации придёт в бота в ближайшее время</b>", {parse_mode: "HTML"}); //
      return ctx.scene.leave();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
);

scene.leave(instruments);

module.exports = scene;
