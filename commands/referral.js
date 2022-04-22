const { Markup } = require("telegraf");
const { User } = require("../database");
const locale = require("../locale");
const { BOT_LOGIN } = require("../config/index");

module.exports = async (ctx) => {
  try {
    // let referralsCount = await User.count({
    //   where: {
    //     referral: ctx.from.id,
    //   },
    // });
    // if (!referralsCount) {
    //   referralsCount = 0;
    // }
    var referralsFromDb = await User.findAll({
      where: {
        referral: ctx.from.id,
      },
    });

    var referrals = [];
    for (let i = 0; i < referralsFromDb.length; i++) {
      if (referralsFromDb[i].username != referralsFromDb[i].id) {
        referrals.push(`@${referralsFromDb[i].username}`);
      } else {
        referrals.push(`${referralsFromDb[i].username}`);
      }
    }

    var text = `📊 <b>Реферальная программа</b>

<i>Ты будешь получать 1% с каждого профита, который заведёт пользователь, перешедший по твоей ссылке (пользователь должен быть уже принят в нашу команду)</i>

🧲 <b>Количество рефералов:</b> ${referralsFromDb.length}
🔗 <b>Ваша реферальная ссылка:</b> https://t.me/${BOT_LOGIN}?start=${ctx.from.id}`;

    if (referrals.length != 0) {
      text += `\n👨‍👨‍👦 <b>Ваши рефералы:</b> ${referrals.join(", ")}`
    }
    
    return ctx
      .replyOrEdit(text, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton(locale.go_back, "instruments")],
        ]),
      })
  } catch (err) {
    console.log(err)
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
