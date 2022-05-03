const { Composer, Markup } = require("telegraf");
const { Country, SupportTemplate, SupportChat, SupportUser, User } = require("../database");
const chunk = require("chunk");
const locale = require("../locale");

const support = new Composer();

support.action("support_inst", async (ctx) => {
  let button = [];
  if (ctx.state.user.status != 0) {
    const requestSupp = await SupportUser.findOne({
      order: [["id", "asc"]],
      where: {
        status: 1,
        userId: ctx.from.id,
      },
    });
    if (requestSupp) {
      button = [Markup.callbackButton("Удалить анкету", "support_delete_anket")];
    } else {
      button = [Markup.callbackButton("Создать анкету", "support_create_anket")];
    }
  }
  ctx.replyOrEdit(
    `👨‍💻 Система Технической поддежки поможет тебе начать зарабатывать твои первые деньги!
🧨 Совсем новенький и чувствуешь себя неуверенно в этой сфере ?  Ничего страшного. Просто заведи человека на ссылку, а человек с огромным опытом сделает всё за тебя
📖 Так же ты можешь добавить свои шаблоны, чтобы удобно и быстро отвечать в боте`,
    {
      reply_markup: Markup.inlineKeyboard([
        [
          ctx.state.user.mySupport
            ? Markup.callbackButton("Убрать с тп", "support_kick")
            : Markup.callbackButton("Списки", "support_list"),
          Markup.callbackButton("📖 Шаблоны", "support_temp"),
        ],
        button,
        [Markup.callbackButton(locale.go_back, "instruments")],
      ]),
    }
  );
});

support.action("support_temp", (ctx) => {
  ctx.replyOrEdit(`📖 Здесь вы можете удалять/добавлять новые шаблоны для Технической Поддержки`, {
    reply_markup: Markup.inlineKeyboard([
      [Markup.callbackButton("📖 Шаблоны", "support_temp_list"), Markup.callbackButton("📖 Добавить Шаблон", "support_add_temp")],
    ]),
  });
});

support.action("support_add_temp", async (ctx) => {
  const countries = await Country.findAll({
    order: [["id", "asc"]],
    where: {
      status: 1,
    },
  });
  ctx.replyOrEdit(`🔧 Выберите страну`, {
    reply_markup: Markup.inlineKeyboard([
      ...chunk(countries.map((v) => Markup.callbackButton(v.title, `add_temp_supp_${v.id}`))),
    ]),
  });
});

support.action("support_temp_list", async (ctx) => {
  const countries = await Country.findAll({
    order: [["id", "asc"]],
    where: {
      status: 1,
    },
  });
  ctx.replyOrEdit(`🔧 Выберите страну`, {
    reply_markup: Markup.inlineKeyboard([
      ...chunk(countries.map((v) => Markup.callbackButton(v.title, `get_temp_supp_${v.id}`))),
    ]),
  });
});

support.action("support_list", async (ctx) => {
  const requestSupp = await SupportUser.findAll({
    order: [["id", "asc"]],
    where: {
      status: 1,
    },
  });
  if (requestSupp.length > 0) {
    requestSupp.forEach((temp) => {
      ctx.replyWithHTML(
        `📰 <b>Анкета ТП</b>

👑 <b>@${temp.username}</b>
📉 <b>Процент: 4%</b>
📝 <b>Описание:</b>
${temp.text}`,
        {
          reply_markup: Markup.inlineKeyboard([Markup.callbackButton("Взять", "set_my_support:" + temp.userId)]),
        }
      );
    });
  } else {
    ctx.replyOrEdit("❌ <b>Ошибка, пока что нет анкет</b>", {
      reply_markup: Markup.inlineKeyboard([Markup.callbackButton("Назад", "support_inst")]),
      parse_mode: "HTML",
    });
  }
});

support.action("support_create_anket", (ctx) => {
  ctx.scene.enter("create_supp_anket");
});

support.action("support_delete_anket", async (ctx) => {
  try {
    const requestSupp = await SupportUser.findOne({
      order: [["id", "asc"]],
      where: {
        status: 1,
        userId: ctx.from.id,
      },
    });
    if (requestSupp) {
      await requestSupp.update({
        status: 0,
      });
      ctx.replyOrEdit("❌ Ваша анкета была удалена", {
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton(locale.go_back, "support_inst")]]),
      });
    } else {
      return ctx.reply("❌ Ошибка, анкета не найдена");
    }
  } catch {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
});

support.action("support_kick", async (ctx) => {
  try {
    if (ctx.state.user.mySupport) {
      ctx.telegram.sendMessage(
        ctx.state.user.mySupport,
        `От вашего тп отказался <b><a href="tg://user?id=${ctx.from.id}">${ctx.from.username}</a></b>`,
        {
          parse_mode: "HTML",
        }
      );
      const user = await User.findOne({
        where: {
          id: ctx.from.id,
        },
      });
      await user.update({
        mySupport: 0,
      });
      ctx.replyOrEdit(`✅ <b>Вы успешно отказались от саппорта</b>`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton(locale.go_back, "support_inst")]]),
      });
    } else {
      ctx.reply("У тебя нет человека на тп");
    }
  } catch {
    ctx.reply("❌ Ошибка");
  }
});

support.action(/set_my_support:(\d+)/, async (ctx) => {
  try {
    const user = await User.findOne({
      where: {
        id: ctx.from.id,
      },
    });
    if (user.id != ctx.match[1]) {
      await user.update({
        mySupport: ctx.match[1],
      });
      ctx.replyOrEdit(`✅ <b>Вы успешно взяли саппорта</b>`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton(locale.go_back, "support_inst")]]),
      });
      ctx.telegram.sendMessage(
        ctx.match[1],
        `📝 <b>Вас взяли в роли саппорта на тп @${ctx.from?.username}</b>`, //`<b><a href="tg://user?id=${ctx.from.id}">${ctx.from.username}</a></b> взял вас в роли саппорта`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: `@${ctx.from?.username}`, url: `tg://user?id=${ctx.from.id}` }]],
          },
          parse_mode: "HTML",
        }
      );
    } else {
      ctx.reply("Вы не можете взять свою анкету");
    }
  } catch {
    ctx.reply("❌ Ошибка");
  }
});

support.action(/add_temp_supp_([a-z]{2,3})/, async (ctx) => {
  ctx.scene.enter("add_temp_supp", {
    countryCode: ctx.match[1],
  });
});

support.action(/get_temp_supp_([a-z]{2,3})/, async (ctx) => {
  const template = await SupportTemplate.findAll({
    order: [["id", "asc"]],
    where: {
      status: 1,
      userID: ctx.from.id,
      countryCode: ctx.match[1],
    },
  });
  if (template.length > 0) {
    template.forEach((temp) => {
      ctx.replyWithHTML(`🔰 <b>Название:</b> ${temp.title}\n📋 <b>Текст:</b> <code>${temp.message}</code>`, {
        reply_markup: Markup.inlineKeyboard([Markup.callbackButton("Удалить", "delete_supp_temp_" + temp.id)]),
      });
    });
  } else {
    ctx.replyOrEdit("❌ <b>Ошибка, у вас нет шаблона</b>", {
      reply_markup: Markup.inlineKeyboard([Markup.callbackButton("Назад", "support_temp")]),
      parse_mode: "HTML",
    });
  }
});

support.action(/delete_supp_temp_([0-9]+)/, async (ctx) => {
  try {
    const template = await SupportTemplate.findOne({
      where: {
        id: ctx.match[1],
        userId: ctx.from.id,
      },
    });
    await template.update({
      status: 0,
    });
    ctx.replyOrEdit("❌ <b>Шаблон успешно удален</b>", {
      reply_markup: Markup.inlineKeyboard([Markup.callbackButton("Назад", "support_temp")]),
      parse_mode: "HTML",
    });
  } catch (err) {}
});

support.action(/^get_all_temp_country:([a-z]+)_sup:([0-9]+)$/, async (ctx) => {
  try {
    var button = [[Markup.callbackButton("✍️ Отправить сообщение в ТП", `support_${ctx.match[2]}_send_message`)]];
    const template = await SupportTemplate.findAll({
      order: [["id", "asc"]],
      where: {
        status: 1,
        userID: ctx.from.id,
        countryCode: ctx.match[1],
      },
    });
    if (template.length > 0) {
      template.forEach((temp) => {
        button.push([Markup.callbackButton(temp.title, `send_message_temp_${temp.id}_sup_${ctx.match[2]}`)]);
      });
      ctx.editMessageReplyMarkup(Markup.inlineKeyboard(button));
    } else {
      ctx.replyWithHTML(`❌ <b>Ошибка, у вас нет шаблона</b>`);
    }
  } catch (e) {
    ctx.replyWithHTML(`❌ <b>Ошибка</b>`);
  }
});

support.action(/^send_message_temp_([0-9]+)_sup_([0-9]+)$/, async (ctx) => {
  const template = await SupportTemplate.findOne({
    where: {
      id: ctx.match[1],
      userId: ctx.from.id,
    },
  });
  if (template) {
    await SupportChat.create({
      messageFrom: 0,
      supportId: ctx.match[2],
      message: template.message,
      messageId: ctx.callbackQuery.message.message_id,
    });
    await ctx.answerCbQuery(`✅ Сообщение отправлено`);
    await ctx.reply(`✅ Сообщение отправлено: ${template.message}`);
  } else {
    ctx.replyWithHTML(`❌ <b>Ошибка</b>`);
  }
});

support.action(/^support_(\d+)_send_message$/, (ctx) =>
  ctx.scene.enter("support_send_message", {
    supportId: ctx.match[1],
  })
);

support.action(/^support_check_(\d+)_online$/, async (ctx) => {
  await SupportChat.create({
    messageFrom: 0,
    supportId: ctx.match[1],
    message: `ef23f32dkd90843jhADh983d23jd9`,
    messageId: ctx.callbackQuery.message.message_id,
  });

  ctx.answerCbQuery("♻️ Проверяем онлайн...");
});

module.exports = support;
