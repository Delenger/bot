const { Markup } = require("telegraf");
const locale = require("../locale");

module.exports = async (ctx) => {
  return ctx
    .replyOrEdit(`🚀 Система НАСТАВНИКОВ поможет зарабатывать тебе твой первый кэш!
💡 Наши ПРО-воркеры с огромным опытом и стажем научат тебя уникальным фишкам, грамотному общению с мамонтами и расскажут все нюансы нашей работы!
💡 Совсем новенький и чувствуешь себя неуверенно в этой сфере? 
💡 Тогда быстрее обращайся к одному из наставников и начинай подниматься уже сейчас
💡 С каждого профита наставник будет получать 5%`, {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.callbackButton(locale.mentors.mentors_list, "mentors_list"),
        ],
        [
          Markup.callbackButton(locale.mentors.change_mentor, "change_mentor"),
        ],
        [
          ...(ctx.state.user.status === 3 || ctx.state.user.status === 1
            ? 
              [
                Markup.callbackButton(locale.mentors.my_anket, `my_mentor_anket`),
              ]
            : []),
        ],
        [Markup.callbackButton(locale.go_back, "instruments")],
      ]),
      parse_mode: "HTML",
    })
    .catch ((err) => ctx.reply("❌ Ошибка"));
};
