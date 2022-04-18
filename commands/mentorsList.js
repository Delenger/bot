const { Mentor } = require("../database");
const mentorAnket = require("./mentorAnket");

module.exports = async (ctx) => {
  try {
		const allMentors =  await Mentor.findAll();

		if (allMentors.length == 0) {
			return ctx.reply("❌ <b>Список наставников пуст</b>", {parse_mode: "HTML"}).catch((err) => err);
		}
		for (let i = 0; i < allMentors.length; i++) {
			await mentorAnket(ctx, allMentors[i].id);		
		}

    return ctx.reply("✅ <b>Вы просмотрели список наставников. Определитесь, нажмите в инструментах \"Сменить наставника\" и укажите его логин</b>", {
			parse_mode: "HTML",
		}).catch((err) => err);
  } catch (err) {
		console.log(err)
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
