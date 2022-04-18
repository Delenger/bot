const { Markup } = require("telegraf");
const { Mentor, User } = require("../database");
const locale = require("../locale");

module.exports = async (ctx, id, with_delete = false) => {
  try {
    const anket = await Mentor.findByPk(id);
    if (anket.userId !== ctx.from.id && ctx.state.user.status !== 1) {
      with_delete = false;
    }

    let studentsCount = await User.count({
      where: {
        myMentor: anket.userId,
      },
    });

    let messageText = locale.mentors.anket
      .replace("{id}", anket.id)
      .replace("{mentorUsername}", anket.username)
      .replace("{countries}", anket.countries)
      .replace("{students}", studentsCount)
      .replace("{text}", anket.text);
    await ctx.reply(messageText, {
      parse_mode: "HTML",
      disable_notification: true,
      disable_web_page_preview: true,
      reply_markup: Markup.inlineKeyboard([
        [
          ...(with_delete ?  [Markup.callbackButton(locale.mentors.delete_anket, `mentor_anket_delete_${anket.id}`)] : []),
        ],
      ]),
    }).catch((err) => err);
    if (with_delete) {
      const students = await User.findAll({
        where: {
          myMentor: anket.userId,
        },
      });
      if (students.length != 0) {
        let studentsMessage = "📚 <b>Список учеников:</b>";

        for (let i = 0; i < students.length; i++) {
          studentsMessage += `\n<b>— @${students[i].username}</b>`
        }

        await ctx.reply(studentsMessage, {
          parse_mode: "HTML",
          disable_notification: true,
          disable_web_page_preview: true,
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton(locale.mentors.delete_student, `mentor_student_delete_${anket.id}`)],
          ]),
        }).catch((err) => err);
      }
    }
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
