const { Markup } = require("telegraf");
const locale = require("../locale");
const { User } = require("../database");

module.exports = async (ctx) => {
  const user = await User.findByPk(ctx.from.id);
  return ctx
    .replyOrEdit(
      `👨‍🎓 Система Наставников поможет тебе начать зарабатывать твои первые деньги!
💡 Наши Наставники с огромным опытом и стажем научат тебя тонкостям, грамотному общению с мамонтами и расскажут все нюансы нашей работы!
💡 Совсем новенький и чувствуешь себя неуверенно в этой сфере? 
💡 Тогда быстрее обращайся к одному из наставников и начинай подниматься уже сейчас
💡 Наставник будет получать 5% от каждого твоего профита`,
      {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton(locale.mentors.mentors_list, "mentors_list")],
          [
            ...(!user.myMentor
              ? [Markup.callbackButton(locale.mentors.change_mentor, "change_mentor")]
              : []),
          ],
          [
            ...(ctx.state.user.status === 3 || ctx.state.user.status === 1
              ? [Markup.callbackButton(locale.mentors.my_anket, `my_mentor_anket`)]
              : []),
          ],
          [Markup.callbackButton(locale.go_back, "instruments")],
        ]),
        parse_mode: "HTML",
      }
    )
    .catch((err) => ctx.reply("❌ Ошибка"));
};
