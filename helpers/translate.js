const translate = require("translate");

module.exports = async (text, lang) => {
  try {
    return await translate(text, lang);
  } catch {
    return "Не удалось перевести текст";
  }
};
