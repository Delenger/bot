const { Markup } = require("telegraf");
const { Profit, Ad, User } = require("../database");
const declOfNum = require("../helpers/declOfNum");
const moment = require("../helpers/moment");
const locale = require("../locale");

module.exports = async (ctx) => {
  try {
    var text = locale.mainMenu.text;
    var last_ads = await Ad.findAll({
      order: [["createdAt", "asc"]],
      where: {
        userId: ctx.from.id,
      },
    });
    var profitsCount = await Profit.count({
        where: {
          userId: ctx.from.id,
        },
      }),
      profitsSum = parseInt(
        await Profit.sum("convertedAmount", {
          where: { userId: ctx.from.id },
        })
      );
    if (!profitsSum) {
      profitsSum = 0;
    }
    (adsCount = await Ad.count({
      where: {
        userId: ctx.from.id,
      },
    })),
      (daysWithUs = moment().diff(moment(ctx.state.user.createdAt), "days")),
      (hoursWithUs = moment().diff(moment(ctx.state.user.createdAt), "hours")),
      (minutesWithUs = moment().diff(moment(ctx.state.user.createdAt), "minutes")),
      (secondsWithUs = moment().diff(moment(ctx.state.user.createdAt), "seconds"));

    const user = await User.findByPk(ctx.from.id);

    let USDTWallet = user.USDTWallet ? user.USDTWallet : "Не установлен";

    let myMentor;
    if (user.myMentor) {
      const mentor = await User.findByPk(user.myMentor);
      // myMentor = `<a href="tg://user?id=${mentor.id}">${mentor.username}</a> (${mentor.id})`;
      myMentor = `@${mentor.username}`;
    } else {
      myMentor = "Нет";
    }

    let mySupport;
    if (user.mySupport) {
      const support = await User.findByPk(user.mySupport);
      mySupport = `@${support.username}`;
    } else {
      mySupport = "Нет";
    }

    let toPro;
    if (profitsSum >= 250000 && user.status === 0) {
      await user.update({
        status: 3,
      });
    }
    if (user.status === 3) {
      toPro = "-";
    } else if (profitsSum < 250000) {
      toPro = `${250000 - profitsSum} RUB`;
    } else {
      toPro = "-";
    }

    withUsText = `${daysWithUs} ${declOfNum(daysWithUs, ["день", "дня", "дней"])}`;
    if (daysWithUs < 1) withUsText = `${hoursWithUs} ${declOfNum(hoursWithUs, ["час", "часа", "часов"])}`;
    if (hoursWithUs < 1) withUsText = `${minutesWithUs} ${declOfNum(minutesWithUs, ["минуту", "минуты", "минут"])}`;
    if (minutesWithUs < 1) withUsText = `${secondsWithUs} ${declOfNum(secondsWithUs, ["секунду", "секунды", "секунд"])}`;

    var { status } = ctx.state.user;
    text = text
      .replace("{id}", ctx.from.id)
      .replace(
        "{status}",
        status == 1
          ? locale.roles.admin
          : status == 2
          ? locale.roles.writer
          : status == 3
          ? locale.roles.pro
          : locale.roles.worker
      )
      .replace("{USDTWallet}", USDTWallet)
      .replace("{profits_count}", profitsCount)
      .replace("{profits_sum}", `${profitsSum} RUB`)
      .replace("{ads_count}", adsCount)
      .replace("{my_mentor}", myMentor)
      .replace("{my_support}", mySupport)
      .replace("{to_pro}", toPro)
      .replace("{with_us}", withUsText)
      .replace("{last_time_ad}", moment(last_ads[last_ads.length - 1].createdAt).format("DD.MM.YYYY hh:mm"))
      .replace("{hide_nick}", ctx.state.user.hideNick ? "Скрыт 🔴" : "Виден 🟢");

    return ctx
      .replyWithPhoto("https://i.pinimg.com/originals/70/37/2d/70372d1c3c998ee77ab87f4fde2c82e0.png", {
        caption: text,
        parse_mode: "HTML",
        // reply_markup: Markup.inlineKeyboard([
        //   [
        //     Markup.callbackButton(
        //       locale.mainMenu.buttons.create_link,
        //       "create_link"
        //     ),
        //     Markup.callbackButton(locale.mainMenu.buttons.my_ads, "my_ads_1")
        //   ],
        //   [
        //     Markup.callbackButton(
        //       locale.mainMenu.buttons.my_profits,
        //       "my_profits_1"
        //     ),
        //     Markup.callbackButton(
        //       locale.mainMenu.buttons.workers_top,
        //       "workers_top"
        //     ),
        //   ],
        //   ...(ctx.state.user.status !== 0 && process.env.SMS_TOKEN
        //     ? [
        //         [
        //           Markup.callbackButton(
        //             locale.mainMenu.buttons.send_sms,
        //             "send_sms"
        //           ),
        //         ],
        //       ]
        //     : []),
        //   [
        //     Markup.callbackButton(locale.mainMenu.buttons.writer, "writers"),
        //     Markup.callbackButton(locale.mainMenu.buttons.chats, "chats"),
        //   ],
        //   [Markup.callbackButton(locale.mainMenu.buttons.settings, "settings")],
        // ]),
        reply_markup: Markup.keyboard([
          [locale.mainMenu.buttons.main_menu],
          [locale.mainMenu.buttons.create_link, locale.mainMenu.buttons.my_ads],
          [locale.mainMenu.buttons.my_profits, locale.mainMenu.buttons.information],
          [locale.mainMenu.buttons.instruments],
          // [
          //   locale.mainMenu.buttons.writer,
          //   locale.mainMenu.buttons.chats,
          // ],
          // [locale.mainMenu.buttons.settings],
        ]).resize(),
      })
      .catch((err) =>
        ctx.reply(text, {
          parse_mode: "HTML",
          reply_markup: Markup.keyboard([
            [locale.mainMenu.buttons.main_menu],
            [locale.mainMenu.buttons.create_link, locale.mainMenu.buttons.my_ads],
            [locale.mainMenu.buttons.my_profits, locale.mainMenu.buttons.information],
            [locale.mainMenu.buttons.instruments],
          ]).resize(),
        })
      );
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
