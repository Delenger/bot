const { Op } = require("sequelize");
const { Markup } = require("telegraf");
const WizardScene = require("telegraf/scenes/wizard");
const user = require("../../commands/admin/user");
const { User, Profit, Currency } = require("../../database");
const log = require("../../helpers/log");
const locale = require("../../locale");

const scene = new WizardScene(
  "admin_add_profit",
  async (ctx) => {
    try {
      await ctx.scene.reply("Введите username или ID вбивера", {
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("Отменить", "cancel")],
        ]),
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
      ctx.message.text = ctx.message.text.replace("@", "");
      const user = await User.findOne({
        where: {
          [Op.or]: [
            {
              username: ctx.message.text,
            },
            {
              id: ctx.message.text,
            },
          ],
        },
      });
      if (!user) {
        ctx.reply("❌ Пользователь не найден").catch((err) => err);
        return ctx.wizard.prevStep();
      }

      ctx.scene.state.data.writer = user.id;

      return ctx.wizard.nextStep();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      await ctx.scene.reply(
        `Введите сумму залета (только число, в ${ctx.scene.state.currency})`,
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton("Отменить", "cancel")],
          ]),
        }
      );

      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      var amount = parseFloat(ctx.message?.text);
      if (isNaN(amount)) return ctx.wizard.prevStep();
      amount = amount.toFixed(2);

      var userWorker = await User.findByPk(ctx.scene.state.userId);
      var userReferral;
      var amountReferral;
      var userMentor;
      var amountMentor;
      var userSupport;
      var amountSupport;

      if (userWorker.referral) {
        userReferral = await User.findByPk(userWorker.referral);

        amountReferral = parseFloat((amount / 100) * 1).toFixed(2);
        amount -= amountReferral;
      }

      if (userWorker.myMentor) {
        userMentor = await User.findByPk(userWorker.myMentor);

        amountMentor = parseFloat((amount / 100) * 5).toFixed(2);
        amount -= amountMentor;
      }

      if (userWorker.mySupport) {
        userSupport = await User.findByPk(userWorker.mySupport);

        amountSupport = parseFloat((amount / 100) * 4).toFixed(2);
        amount -= amountSupport;
      }

      const currency = await Currency.findOne({
        where: {
          code: ctx.scene.state.currency,
        },
      });

      var convertedAmount = (
        parseFloat(amount) * parseFloat(currency.rub)
      ).toFixed(2);

      let userProfitsSum = parseInt(
        await Profit.sum("convertedAmount", {
          where: { userId: userWorker.id },
        })
      );
      if (!userProfitsSum) userProfitsSum = 0;
      if (userWorker.status === 0 && (+convertedAmount + +userProfitsSum) >= 250000) {
        await userWorker.update({
          status: 3,
        });
      }

      const profit = await Profit.create({
        userId: ctx.scene.state.userId,
        amount,
        convertedAmount,
        currency: String(currency.code).toUpperCase(),
        serviceTitle: ctx.scene.state.serviceTitle,
        writerId: ctx.scene.state.data.writer,
      });
      const profitUser = await profit.getUser(),
        profitWriter = await profit.getWriter();
      var text = locale.newProfit.channel;

      var profitReferral;
      if (userWorker.referral) {
        const convertedAmountReferral = (parseFloat(amountReferral) * parseFloat(currency.rub)).toFixed(2)
        profitReferral = await Profit.create({
          userId: userReferral.id,
          amount: amountReferral,
          convertedAmount: convertedAmountReferral,
          currency: String(currency.code).toUpperCase(),
          serviceTitle: "👥 Рефералка",
          writerId: ctx.scene.state.data.writer,
        });
      }

      var profitMentor;
      if (userWorker.myMentor) {
        const convertedAmountMentor = (parseFloat(amountMentor) * parseFloat(currency.rub)).toFixed(2)
        profitMentor = await Profit.create({
          userId: userMentor.id,
          amount: amountMentor,
          convertedAmount: convertedAmountMentor,
          currency: String(currency.code).toUpperCase(),
          serviceTitle: "👨‍🎓 Наставник",
          writerId: ctx.scene.state.data.writer,
        });
      }

      var profitSupport;
      if (userWorker.mySupport) {
        const convertedAmountSupport = (parseFloat(amountSupport) * parseFloat(currency.rub)).toFixed(2)
        profitSupport = await Profit.create({
          userId: userSupport.id,
          amount: amountSupport,
          convertedAmount: convertedAmountSupport,
          currency: String(currency.code).toUpperCase(),
          serviceTitle: "👨‍💻 Тех. поддержка",
          writerId: ctx.scene.state.data.writer,
        });
      }

      var workerAmount = (
          (parseFloat(profit.amount) / 100) *
          parseFloat(ctx.state.bot.payoutPercent)
        ).toFixed(2),
        workerConvertedAmount = (
          parseFloat(workerAmount) * parseFloat(currency.rub)
        ).toFixed(2);

      text = text
        .replace("{serviceTitle}", ctx.scene.state.serviceTitle)
        .replace(
          "{amount}",
          `${profit.amount} ${profit.currency} | ${profit.convertedAmount} RUB`
        )
        .replace(
          `{workerAmount}`,
          `${workerAmount} ${profit.currency} | ${workerConvertedAmount} RUB`
        )
        .replace(
          "{worker}",
          profitUser.hideNick
            ? "Скрыт"
            : `<a href="tg://user?id=${profit.userId}">${profitUser.username}</a>`
        )
        .replace(
          "{writer}",
          `<a href="tg://user?id=${profitWriter.id}">${profitWriter.username}</a>`
        )
        .replace("{profitId}", profit.id);
      const msg = await ctx.telegram
        .sendMessage(ctx.state.bot.payoutsChannelId, text, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit.wait, "none")],
          ]),
        })
        .catch((err) => err);
      await profit.update({
        channelMessageId: msg.message_id,
      });

      if (profitReferral) {
        const textReferral = locale.newProfit.channelReferal
          .replace("{profitId}", profitReferral.id)
          .replace(
            "{amount}",
            `${profitReferral.amount} ${profitReferral.currency} | ${profitReferral.convertedAmount} RUB`
          )
          .replace(
            "{worker}",
            userReferral.hideNick
              ? "Скрыт"
              : `<a href="tg://user?id=${profitReferral.userId}">${userReferral.username}</a>`
          )
        const msgReferral = await ctx.telegram.sendMessage(ctx.state.bot.payoutsChannelId, textReferral, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit.wait, "none")],
          ]),
        });
        await profitReferral.update({
          channelMessageId: msgReferral.message_id,
        });
        await ctx.telegram.sendMessage(
          userReferral.id,
          locale.newProfit.referral
            .replace("{profitId}", profitReferral.id)
            .replace(
              "{amount}",
              `${profitReferral.amount} ${profitReferral.currency} | ${profitReferral.convertedAmount} RUB`
            ),
          {
            parse_mode: "HTML",
          }
        );
      }

      if (profitMentor) {
        const textMentor = locale.newProfit.channelMentor
          .replace("{profitId}", profitMentor.id)
          .replace(
            "{amount}",
            `${profitMentor.amount} ${profitMentor.currency} | ${profitMentor.convertedAmount} RUB`
          )
          .replace(
            "{worker}",
            userMentor.hideNick
              ? "Скрыт"
              : `<a href="tg://user?id=${profitMentor.userId}">${userMentor.username}</a>`
          )
        const msgMentor = await ctx.telegram.sendMessage(ctx.state.bot.payoutsChannelId, textMentor, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit.wait, "none")],
          ]),
        });
        await profitMentor.update({
          channelMessageId: msgMentor.message_id,
        });
        await ctx.telegram.sendMessage(
          userMentor.id,
          locale.newProfit.mentor
            .replace("{profitId}", profitMentor.id)
            .replace(
              "{amount}",
              `${profitMentor.amount} ${profitMentor.currency} | ${profitMentor.convertedAmount} RUB`
            ),
          {
            parse_mode: "HTML",
          }
        );
      }

      if (profitSupport) {
        const textSupport = locale.newProfit.channelSupport
          .replace("{profitId}", profitSupport.id)
          .replace(
            "{amount}",
            `${profitSupport.amount} ${profitSupport.currency} | ${profitSupport.convertedAmount} RUB`
          )
          .replace(
            "{worker}",
            userSupport.hideNick
              ? "Скрыт"
              : `<a href="tg://user?id=${profitSupport.userId}">${userSupport.username}</a>`
          )
        const msgSupport = await ctx.telegram.sendMessage(ctx.state.bot.payoutsChannelId, textSupport, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([
            [Markup.callbackButton(locale.newProfit.wait, "none")],
          ]),
        });
        await profitSupport.update({
          channelMessageId: msgSupport.message_id,
        });
        await ctx.telegram.sendMessage(
          userSupport.id,
          locale.newProfit.support
            .replace("{profitId}", profitSupport.id)
            .replace(
              "{amount}",
              `${profitSupport.amount} ${profitSupport.currency} | ${profitSupport.convertedAmount} RUB`
            ),
          {
            parse_mode: "HTML",
          }
        );
      }

      await ctx.telegram
        .sendMessage(
          profitUser.id,
          locale.newProfit.worker
            .replace("{profitId}", profit.id)
            .replace(
              "{amount}",
              `${profit.amount} ${profit.currency} / ${profit.convertedAmount} RUB`
            )
            .replace(
              `{workerAmount}`,
              `${workerAmount} ${profit.currency} / ${workerConvertedAmount} RUB`
            )
            .replace(
              "{writer}",
              `<a href="tg://user?id=${profitWriter.id}">${profitWriter.username}</a>`
            ),
          {
            parse_mode: "HTML",
          }
        )
        .catch((err) => err);
      log(
        ctx,
        `добавил новый профит #${profit.id} суммой ${profit.amount} ${profit.currency} для пользователя <b><a href="tg://user?id=${profitUser.id}">${profitUser.username}</a></b>`
      );
      await ctx.reply("✅ Профит добавлен!").catch((err) => err);
    } catch (err) {
      console.log(err)
      ctx.reply("❌ Ошибка").catch((err) => err);
    }
    return ctx.scene.leave();
  }
);

scene.leave((ctx) => user(ctx, ctx.scene.state.userId));

module.exports = scene;
