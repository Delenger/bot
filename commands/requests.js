const { Markup } = require("telegraf");
const locale = require("../locale");

module.exports = async (ctx) => {
  try {
    return ctx
      .replyWithPhoto("https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/445fd962883585.5a9ed87691b84.jpg", {
        caption: locale.requests.need_send_request,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton(locale.requests.ready_send_button, "send_request")]]),
      })
      .catch((err) =>
        ctx.replyOrEdit(locale.requests.need_send_request, {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton(locale.requests.ready_send_button, "send_request")]]),
        })
      );
  } catch {
    console.log("Error");
  }
};
