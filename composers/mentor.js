const { Composer } = require("telegraf");
const { Profit } = require("../database");
const myProfits = require("../commands/myProfits");
const myProfit = require("../commands/myProfit");
const workersTop = require("../commands/workersTop");
const { Markup } = require("telegraf");
const moment = require("moment");
const { Op } = require("sequelize");
const locale = require("../locale");
const { Mentor, User } = require("../database");
const mentors = require("../commands/mentors");
const mentorAnket = require("../commands/mentorAnket");
const mentorAnketDelete = require("../commands/mentorAnketDelete");
const mentorsList = require("../commands/mentorsList");

const composer = new Composer();

composer.action("mentors", mentors);

composer.action("mentors_list", mentorsList);

composer.action("my_mentor_anket", async (ctx) => {
  if (ctx.state.user.status === 3 || ctx.state.user.status === 1) {
    const anket = await Mentor.findOne({
      where: {
        userId: ctx.from.id,
      },
    });

    if (anket) {
      return mentorAnket(ctx, anket.id, true);
    } else {
      return ctx.reply("❌ <b>У вас нет анкеты, нажмите на кнопку ниже, чтобы её создать</b>", {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton(locale.mentors.create_anket, "create_anket")]]),
        parse_mode: "HTML",
      });
    }
  }
});

composer.action("change_mentor", (ctx) => {
  ctx.scene.enter("change_mentor", {
    workerId: ctx.from.id,
  });
});

composer.action("create_anket", (ctx) => {
  if (ctx.state.user.status === 3  || ctx.state.user.status === 1) {
    return ctx.scene.enter("create_mentor_anket");
  }
});

// composer.action("mentor_student_delete", (ctx) => {
//   if (ctx.state.user.status === 3 || ctx.state.user.status === 1) {
//     return ctx.scene.enter("remove_mentor_student");
//   }
// });

composer.action(/^mentor_anket_(\d+)$/, (ctx) => mentorAnket(ctx, ctx.match[1]));

composer.action(/^mentor_anket_delete_(\d+)$/, (ctx) => mentorAnketDelete(ctx, ctx.match[1]));

composer.action(/^mentor_student_delete_(\d+)$/, (ctx) => {
  if (ctx.state.user.status === 3 || ctx.state.user.status === 1) {
    return ctx.scene.enter("remove_mentor_student", {
      anketId: ctx.match[1]
    });
  }
});

module.exports = composer;
