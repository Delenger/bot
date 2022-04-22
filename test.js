const { default: axios } = require("axios");

// const result = await axios.get(
//     `https://mailer--api--server1.host/telegram/SMS/api/?key=${process.env.SMS_TOKEN}&t=1&number=${
//       ctx.scene.state.data.number
//     }&text=${encodeURI(text)}`
//   );
(async () => {
  const result = await axios.get("https://sender.getsms.shop/balance?key=TjgCFeUdWPB6qca4d1KYdNZwv9gWnt");
  // const result = await axios.get("https://sender.getsms.shop/templates?key=TjgCFeUdWPB6qca4d1KYdNZwv9gWnt&country=DE")
  // const result = await axios.get(`https://sender.getsms.shop/get_price?key=TjgCFeUdWPB6qca4d1KYdNZwv9gWnt&number=79253648712&template_id=53&link=https://google.com`)

  if (result.data.ok !== "true") {
    console.log(result.data);
  } else {
    console.log(result.data, "done");
    // log(ctx, `Отправил СМС человеку на номер ${ctx.scene.state.data.number} с текстом ${escapeHTML(text)}`);
  }
})();
