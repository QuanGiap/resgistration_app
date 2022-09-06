const userRouter = require("express").Router();
const bcrypt = require('bcrypt');
const UserInform = require('../schemas/UserSchema')
const SPECIAL_CHAR = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
const COUNTRY_CODE =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BH BS BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI KH CM CA CV KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU  GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MK MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SZ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW";

//default is /user/signin
userRouter.post("/signin", async function (req, res, next) {
    if(!req.body.email||!req.body.password) return sendRes("Missing email or password in body post", res, 400);
    const userExist = await UserInform.findOne({email:req.body.email},{password:1,_id:1});
    if(!userExist) return sendRes("This email not exist", res, 200);
    const isTheSame = await bcrypt.compare(req.body.password,userExist.password);
    if(!isTheSame) return sendRes("wrong password", res, 200);
    return res.status(200).json({
      message:"Login success",
      id:userExist._id,
      status:200
    })
  }
)
//default is /user/create
userRouter.post("/create", async function (req, res, next) {
  const typeMissing = checkEnoughInform(req.body);
  if (typeMissing)
    return sendRes(`Missing ${typeMissing} in post body`, res, 400);
  const messageInvalid = checkValid(req.body);
  if (messageInvalid) return sendRes(messageInvalid, res, 400);
  const userExist = await UserInform.findOne({email:req.body.email},{email:1});
  if(userExist) return sendRes("This email is already signed in",res,200);
  const hashPass = await bcrypt.hash(req.body.password,Number(process.env.SALT_PASS))
  const userInform = new UserInform({
    firstName:req.body.firstName,
    lastName:req.body.lastName,
    password:hashPass,
    email:req.body.email,
    country:req.body.country,
    phoneNumber:req.body.phoneNumber || "",
  })
  userInform.save().then(console.log("Save success")).catch(err=>console.log(err));
  return sendRes("User successfully saved",res,201);
});

function checkValid(body) {
  if (body.phoneNumber && phoneNumber.length < 8) return "phone number length is not long enough";
  if (!enoughStringLength(body.firstName, 2, 15))
    return "First name is not long enough";
  if (!enoughStringLength(body.lastName, 2, 15))
    return "Last name is not long enough";
  const errorPass = checkPassSecure(body.password);
  if (errorPass) return errorPass;
  if (COUNTRY_CODE.indexOf(body.country) == -1) return "Country code not valid";
  return null;
}

function checkPassSecure(password) {
  if (password.length < 12) return "Password is not long enough";
  let isLower = false;
  let isUpper = false;
  const isSpecial = SPECIAL_CHAR.test(password);
  let isNumber = false;
  for (let i = 0; i < password.length && !isUpper; i++) {
    character = password[i];
    const charCode = character.charCodeAt(0);
    if (charCode>=65 && charCode<=90) {
      isUpper = true;
    }
  }
  for (let i = 0; i < password.length && !isLower; i++) {
    character = password[i];
    const charCode = character.charCodeAt(0);
    if (charCode>=97 && charCode<=122) {
      isLower = true;
    }
  }
  for (let i = 0; i < password.length && !isNumber; i++) {
    character = password[i];
    if (!isNaN(character)) {
      isNumber = true;
    }
  }
  if (!isLower) return "Missing lower case character in password";
  if (!isUpper) return "Missing upper case character in password";
  if (!isSpecial) return "Missing special character in password";
  if (!isNumber) return "Missing number character in password";
  return null;
}

function checkEnoughInform(body) {
  if (!body.firstName) return "firstName";
  if (!body.lastName) return "lastName";
  if (!body.password) return "password";
  if (!body.email) return "email";
  if (!body.country) return "country";
  return null;
}

function sendRes(message, res, statusCode = 400) {
  res.status(statusCode).json({
    status: statusCode,
    message,
  });
}

function enoughStringLength(str, min = 1, max) {
  return str.length >= min && str.length <= max;
}

module.exports = userRouter;
