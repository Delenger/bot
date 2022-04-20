const Stage = require("telegraf/stage");

const changeUSDTWallet = require("./scenes/changeUSDTWallet");
const complaint = require("./scenes/complaint");
const whatsappLink = require("./scenes/whatsappLink");
const createMentorAnket = require("./scenes/createMentorAnket");
const changeMentor = require("./scenes/changeMentor");
const removeMentorStudent = require("./scenes/removeMentorStudent");

const adminSendMail = require("./scenes/admin/sendMail");
const adminEditValue = require("./scenes/admin/editValue");
const adminEditUserPercent = require("./scenes/admin/editUserPercent");
const adminAddProfit = require("./scenes/admin/addProfit");
const adminAddWriter = require("./scenes/admin/addWriter");
const adminAddBin = require("./scenes/admin/addBin");
const adminServiceEditDomain = require("./scenes/admin/serviceEditDomain");
const adminAnswerComplaint = require("./scenes/admin/answerComplaint");
const adminEditProDomain = require("./scenes/admin/serviceEditDomainPro");

const editPrice = require("./scenes/ads/editPrice");
const sendRequest = require("./scenes/sendRequest");
const sendSms = require("./scenes/sendSms");
const sendEmail = require("./scenes/sendEmail");

const supportSendMessage = require("./scenes/supportSendMessage");

const gumtreeUk = require("./scenes/createLink/gumtreeUk");

const gumtreeAu = require("./scenes/createLink/gumtreeAu");

const wallapopEs = require("./scenes/createLink/wallapopEs");

const ebayDe = require("./scenes/createLink/ebayDe");

const olxRo = require("./scenes/createLink/olxRo");

const subitoIt = require("./scenes/createLink/subitoIt");

const sbazarCz = require("./scenes/createLink/sBazarCz");

const dhl = require("./scenes/createLink/dhl");

const addsupptemp = require("./scenes/createSuppTemp");

const dpdPl = require("./scenes/createLink/dpdPl");

const inpostPl = require("./scenes/createLink/inpostPl");

const olxPl = require("./scenes/createLink/olxPl");

const tablondeanunciosEs = require("./scenes/createLink/tablondeanunciosEs");

const vintedPl = require("./scenes/createLink/vintedPl");

const vintedIt = require("./scenes/createLink/vintedIt");

const vintedCz = require("./scenes/createLink/vintedCz");

const vintedEs = require("./scenes/createLink/vintedEs");

const vintedDe = require("./scenes/createLink/vintedDe");

const emiratespostAe = require("./scenes/createLink/emiratespostAe");

const create_supp_anket = require("./scenes/createSupReq");

const stage = new Stage([
  changeUSDTWallet,
  complaint,
  whatsappLink,
  createMentorAnket,
  changeMentor,
  removeMentorStudent,
  create_supp_anket,

  gumtreeUk,

  wallapopEs,

  sendRequest,
  sendSms,
  sendEmail,
  editPrice,
  supportSendMessage,

  dpdPl,
  inpostPl,
  olxPl,

  vintedCz,

  vintedIt,
  vintedPl,

  vintedEs,
  vintedDe,

  tablondeanunciosEs,

  olxRo,

  dhl,

  emiratespostAe,

  sbazarCz,

  subitoIt,

  ebayDe,

  adminSendMail,
  adminEditValue,
  adminEditUserPercent,
  adminAddProfit,
  adminAddWriter,
  adminAddBin,
  adminServiceEditDomain,
  adminAnswerComplaint,
  adminEditProDomain,

  addsupptemp,
  gumtreeAu,
]);

stage.action("cancel", async (ctx) => {
  await ctx.replyOrEdit("♻️ <b>Отменено!</b>", { parse_mode: "HTML" });
  await ctx.scene.leave();
});

module.exports = stage;
