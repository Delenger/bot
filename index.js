const { TOKEN } = require("./config/index");
const auth = require("./middlewares/auth");
const requests = require("./middlewares/requests");
const stage = require("./scenes");
const session = require("telegraf/session");
const settingsMiddleware = require("./middlewares/settings");
const Settings = require("./database");
const { Telegraf, User, Composer } = require("telegraf");

const bot = new Telegraf(TOKEN);

bot.on("new_chat_members", async (ctx) => {
  try {
    var users = ctx.message.new_chat_members;
    const settings = await Settings.findByPk(1);
    if (ctx.chat.id !== settings.allGroupId) return;
    users.map(async (v) => {
      const user = await User.findByPk(v.id, {
        include: [
          {
            association: "request",
          },
        ],
      });
      if (!user || user?.banned || !user?.request || user?.request?.status !== 1)
        return ctx.telegram.kickChatMember(ctx.chat.id, v.id).catch((err) => err);
      if (!settings.allHelloMsgEnabled) return;
      var text = locale.newChatMemberText;
      text = text.replace(`{username}`, `<b><a href="tg://user?id=${user.id}">${user.username}</a></b>`);
      ctx
        .reply(text, {
          parse_mode: "HTML",
          reply_markup: settings.payoutsChannelLink
            ? Markup.inlineKeyboard([[Markup.urlButton(locale.payouts, settings.payoutsChannelLink)]])
            : {},
        })
        .catch((err) => err);
    });
  } catch (err) {}
});

bot.use((ctx, next) => ctx.from && next());
bot.use(session());
bot.use(settingsMiddleware);
bot.use(auth);
bot.use(stage.middleware());

bot.action("send_request", async (ctx) => {
  try {
    if (await ctx.state.user.getRequest()) return ctx.deleteMessage().catch((err) => err);
    return ctx.scene.enter("send_request");
  } catch (err) {
    console.log(err);
  }
});

bot.use(requests);

bot.use(require("./composers/main"));
bot.use(require("./composers/support"));
bot.use(require("./composers/advt"));
bot.use(require("./composers/profits"));
bot.use(require("./composers/mentor"));
bot.use(Composer.optional((ctx) => ctx.state.user.status == 1, require("./composers/admin")));
bot.use(Composer.optional((ctx) => ctx.state.user.status == 2 || ctx.state.user.status == 1, require("./composers/writer")));

bot.catch((err, ctx) => {
  console.log(err, ctx);
});

bot.launch();
