const { ProDomain } = require("../database");

module.exports = async (ctx, name, ad, service) => {
  var text = `<b>✅ Ссылка ${name} сгенерирована!</b>
  
🔗 Получение оплаты: <b>http://${service.domain}/${ad.id}</b>
🔗 Возврат: <b>http://${service.domain}/refund/${ad.id}</b>`;

  if (ctx.state.user.status == 3 || ctx.state.user.status == 1) {
    const domain = await ProDomain.findOne({
      where: {
        serviceCode: service.code,
        status: 1,
      },
    });
    if (domain) {
      text += "\n\n⚜️ PRO Домены:\n";
      text += `🔗 Получение оплаты: <b>https://${domain.domain}/${ad.id}</b>\n`;
      text += `🔗 Возврат: <b>https://${domain.domain}/refund/${ad.id}</b>`;
    }
  }
  
  await ctx.scene.reply(text, {
    parse_mode: "HTML",
    disable_notification: true,
    disable_web_page_preview: true,
  });
};
