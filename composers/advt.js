const { Composer, Markup } = require("telegraf");
const { Ad } = require("../database");
const createLink = require("../commands/createLink");
const createLinkCountry = require("../commands/createLinkCountry");
const myAds = require("../commands/myAds");
const myAd = require("../commands/myAd");
const log = require("../helpers/log");
const locale = require("../locale");

const composer = new Composer();

composer.hears(locale.mainMenu.buttons.my_ads, (ctx) => myAds(ctx, 1));

composer.hears(locale.mainMenu.buttons.create_link, createLink);

composer.action(/^my_ad_(\d+)_turn_(on|off)_balanceChecker$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id: ctx.match[1],
        userId: ctx.from.id,
      },
    });
    if (!ad)
      return ctx
        .replyOrEdit("❌ Объявление не найдено", {
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("🔙 Назад", "my_ads_1")]]),
        })
        .catch((err) => err);
    await ad.update({
      balanceChecker: ctx.match[2] == "on",
    });
    log(ctx, `${ad.balanceChecker ? "включил" : "выключил"} чекер баланса для объявления <code>(ID: ${ad.id})</code>`);
    return myAd(ctx, ctx.match[1]);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

composer.action(/^my_ad_(\d+)_edit_price$/, (ctx) =>
  ctx.scene.enter("my_ad_edit_price", {
    adId: ctx.match[1],
  })
);

composer.action(/^my_ad_(\d+)_delete$/, async (ctx) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id: ctx.match[1],
        userId: ctx.from.id,
      },
    });
    if (await ad.destroy()) {
      log(ctx, `удалил объявление <code>(ID: ${ad.id})</code>`);
      await ctx.answerCbQuery("✅ Объявление удалено", true).catch((err) => err);
    }
    return myAds(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

composer.action(/^my_ads_(\d+)$/, (ctx) => myAds(ctx, ctx.match[1]));

composer.action(/^my_ad_(\d+)$/, (ctx) => myAd(ctx, ctx.match[1]));

composer.action("delete_all_my_ads", async (ctx) => {
  try {
    await Ad.destroy({
      where: {
        userId: ctx.from.id,
      },
    });
    await ctx.answerCbQuery("✅ Все ваши объявления были удалены", true).catch((err) => err);
    return myAds(ctx);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

composer.action(/^create_link_service_([A-Za-z0-9_]+)$/, (ctx) => {
  try {
    if (/dhl_(.*)/.test(ctx.match[1])) return ctx.scene.enter(`create_link_dhl`, { country: ctx.match[1].replace("dhl_", "") });
    ctx.scene.enter(`create_link_${ctx.match[1]}`);
  } catch (err) {
    return ctx.reply("❌ Сервис не найден").catch((err) => err);
  }
});

composer.action("create_link", createLink);

composer.action(/^create_link_([A-Za-z0-9]+)$/, (ctx) => createLinkCountry(ctx, ctx.match[1]));

module.exports = composer;
