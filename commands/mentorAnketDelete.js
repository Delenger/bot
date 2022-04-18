const { Mentor, User } = require("../database");

module.exports = async (ctx, id) => {
  try {
    const anket = await Mentor.findByPk(id);

    if (ctx.state.user.status === 1) {
      await anket.destroy();
      return ctx.replyOrEdit("✅ <b>Анкета успешно удалена</b>", {parse_mode: "HTML",}).catch((err) => err);
    } else {
      if (ctx.state.user.id === anket.userId) {
        await anket.destroy();
        return ctx.replyOrEdit("✅ <b>Анкета успешно удалена</b>", {parse_mode: "HTML",}).catch((err) => err);
      }
    }
  } catch (err) {
    console.log(err)
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
