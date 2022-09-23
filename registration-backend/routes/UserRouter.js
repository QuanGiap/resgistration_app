const userRouter = require("express").Router();
const checkObj = require("../tools/checkValidInform");
const checkValid = checkObj.checkValid;
const checkEnoughInform = checkObj.checkEnoughInform;
const bcrypt = require("bcrypt");
const UserInform = require("../schemas/UserSchema");
const jwt = require("jsonwebtoken");
const sendVerifyEmail = require("../tools/sendMail").sendVerifyEmail;
const generatePass = require("../tools/generateRandomPassword");
const userRepo = require("../Repo/UserRepo");
const MAX_TIMEOUT_VERIFY_CODE = 60000; //60 seconds
userRouter.patch("/update_user_inform", async function (req, res, next) {
  verifiedToken(
    req.headers.authorization,
    async (data) => {
      const original = await UserInform.findByIdAndUpdate(data.id, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        country: req.body.country,
        phoneNumber: req.body.phoneNumber,
      });
      if (!original)
        return sendRes("This account id not exist in data base", res, 200);
      return sendRes("Update success", res, 200, true, null, {
        OriginData: original,
      });
    },
    (message) => sendRes(message, res, 400)
  );
});

//default is /user/signin
userRouter.post("/sign_in", async function (req, res, next) {
  if (!req.body.email || !req.body.password)
    return sendRes("Missing email or password in body post", res, 400);
  const userExist = await UserInform.findOne(
    { email: req.body.email },
    { password: 1, _id: 1, hasVerified: 1 }
  );
  if (!userExist) return sendRes("This email not exist", res, 200);
  const isTheSame = await bcrypt.compare(req.body.password, userExist.password);
  if (!isTheSame) return sendRes("wrong password", res, 200);
  const token = jwt.sign({ id: userExist._id }, process.env.SECRET_KEY);
  return sendRes("Login success", res, 200, true, token);
});

userRouter.get("/get_data", async function (req, res, next) {
  verifiedToken(
    req.headers.authorization,
    async (data) => {
      const userInform = await UserInform.findById(data.id);
      if (!userInform)
        return sendRes("Cannot find the data follow your Id", res, 400, false);
      if (!userInform.hasVerified)
        return sendRes(
          "Your email is not verified please verify first",
          res,
          200,
          true
        );
      return res.status(200).json({
        message: "token valid",
        userData: userInform,
      });
    },
    (message) => sendRes(message, res)
  );
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
userRouter.post("/generate_verify_code", async (req, res, next) => {
  try {
    if (!req.body.email)
      throw { message: "mail not included", statusCode: 400, success: false };
    const code = generatePass(8);
    const userExist = await UserInform.findOne(
      { email: req.body.email },
      { hasVerified: 1, _id: 1 }
    );
    if (!userExist)
      throw {
        message: "this email is not found in our data",
        statusCode: 200,
        success: true,
      };
    if (userExist.hasVerified)
      throw {
        message: "this email is already verified",
        statusCode: 200,
        success: true,
      };
    await UserInform.findByIdAndUpdate(userExist._id, {
      codeVerication: {
        code,
        date: Date.now(),
      },
    });
    sendVerifyEmail(req.body.email, code);
    return sendRes("sended validation code", res, 200, true, null, {
      hasSended: true,
    });
  } catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success,
      null,
      { hasSended: false }
    );
  }
});

userRouter.post("/generate_verify_code_new_email", async (req, res, next) => {
  verifiedToken(
    req.headers.authorization,
    async (data) => {
      try {
        if (!req.body.email)
          throw {
            message: "New email not included",
            statusCode: 400,
            success: false,
          };
        const code = generatePass(8);
        const userExist = await UserInform.findOne(
          { email: req.body.email },
          { email: 1 }
        );
        if (userExist)
          throw {
            message: "This email is already existed",
            statusCode: 200,
            success: true,
          };
        await UserInform.findByIdAndUpdate(data.id, {
          codeVerication: {
            code,
            date: Date.now(),
            newEmail: req.body.email,
          },
        });
        sendVerifyEmail(req.body.email, code);
        return sendRes("sended validation code", res, 200, true, null, {
          hasSended: true,
        });
      } catch (e) {
        return sendRes(
          e.message || "Server error",
          res,
          e.statusCode || 500,
          e.success,
          null,
          { hasSended: false }
        );
      }
    },
    () => sendRes("invalid token", res, 403)
  );
});
userRouter.post("/generate_verify_code_change_password", async (req, res, next) => {
  try {
    if (!req.body.email)
      throw {
        message: "New email not included",
        statusCode: 400,
        success: false,
      };
    const code = generatePass(8);
    const userExist = await UserInform.findByIdAndUpdate(data.id, {
      codeVerication: {
        code,
        date: Date.now(),
      },
    });
    if (!userExist)
      throw {
        message: "This email not found in our data",
        statusCode: 200,
        success: true,
      };
    sendVerifyEmail(req.body.email, code);
    return sendRes("sended validation code", res, 200, true, null, {
      hasSended: true,
    });
  } catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success || false,
      null,
      { hasSended: false }
    );
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
userRouter.patch("/verify_code_new_email", async (req, res, next) => {
  try {
    if (!req.body.newEmail)
      throw {message: "New email not included",success: false,statusCode: 400};
    if (!req.body.oldEmail)
      throw {message: "Email that need to change is not included",success: false,statusCode: 400};
    if (!req.body.verificationCode)
      throw {message: "Verication code not included",success: false,statusCode: 400};
    const user = await UserInform.findOne(
      { email: req.body.oldEmail },
      { codeVerication: 1, _id: 1 }
    );
    if (!user)
      throw {message: "Email that need to change not found",success: false,statusCode: 400};
    if (req.body.verificationCode != user.codeVerication.code)
      throw {message: "Your verication code is invalid",success: true,statusCode: 200};
    if (req.body.newEmail != user.codeVerication.newEmail)
      throw {message:"This new email is not the same with the email just got verication code.",success: true,statusCode: 200};
    console.log(Date.now() - user.codeVerication.date);
    if (Date.now() - user.codeVerication.date > MAX_TIMEOUT_VERIFY_CODE)
      throw {message: "This verify code is expired",success: true,statusCode: 200};
    const userOrigin = await UserInform.findByIdAndUpdate(user._id, {
      email: req.body.newEmail,
      codeVerication: { code: "", date: Date.now() },
    });
    if (!userOrigin)
      throw { message: "Update fail", success: true, statusCode: 200 };
    sendRes("Verify success", res, 200, true, null, { verifySuccess: true });
  } catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success,
      null,
      { verifySuccess: false }
    );
  }
});

userRouter.patch("/verify_code_email", async (req, res, next) => {
  try {
    if (!req.body.email)
      throw {message: "New email not included",success: false,statusCode: 400,};

    if (!req.body.verificationCode)
      throw {message: "Verication code not included",success: false,statusCode: 400,};

    const user = await UserInform.findOne(
      { email: req.body.email },
      {
        _id: 1,
        codeVerication: 1,
      }
    );
    if (!user)
      throw { message: "Your email not found", success: true, statusCode: 200};
    if (user.codeVerication.code != req.body.verificationCode)
      throw {message: "Your verication code invalid",success: true,statusCode: 200};

    console.log(Date.now() - user.codeVerication.date);
    if (Date.now() - user.codeVerication.date > MAX_TIMEOUT_VERIFY_CODE)
      throw {message: "Your verication code is expired",success: true,statusCode: 200};

    await UserInform.findOneAndUpdate(
      { email: req.body.email },
      {
        hasVerified: true,
        codeVerication: {
          code: "",
          date: Date.now(),
        },
      }
    );
    return sendRes("Verify successfully", res, 200, true, null, {verifySuccess: true});
  } catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success,
      null,
      { verifySuccess: false }
    );
  }
});
userRouter.patch("/verify_code_change_password",async(req,res,next)=>{
  try{
  if (!req.body.email)
      throw {message: "Email not included",success: false,statusCode: 400};

  if (!req.body.password)
    throw {message: "New password not included",success: false,statusCode: 400};

  if (!req.body.verificationCode)
    throw {message: "Verication code not included",success: false,statusCode: 400};

  await UserInform.findOne({email:req.body.email},{codeVerication:1})
  if(user.codeVerication.code!=req.body.verificationCode) 
    throw {message: "Code invalid",success: false,statusCode: 200};
  if(Date.now()-user.codeVerication.date>MAX_TIMEOUT_VERIFY_CODE)
    throw {message: "Your verication code is expired",success: false,statusCode: 200};

  const isUpdated = await UserInform.findOneAndUpdate({email:req.body.email},{codeVerication:{code:"",date:Date.now()}});
  if(!isUpdated) throw {message: "Update error",success: false,statusCode: 200}
  return sendRes("Verify success", res, 200, true, null, { verifySuccess: true });
  }catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success,
      null,
      { verifySuccess: false }
    );
  }
})
userRouter.post("/checkAccountExist", async (req, res, next) => {
  if (!req.body.email) return sendRes("Email not included", res, 400);
  const userExist = await UserInform.findOne(
    { email: req.body.email },
    { email: 1 }
  );
  if (userExist)
    return sendRes("This email is already signed in", res, 200, true, null, {
      isExist: true,
    });
  return sendRes("This email not in data base", res, 200, true, null, {
    isExist: false,
  });
});
//default is /user/create
userRouter.post("/create", async function (req, res, next) {
  const typeMissing = checkEnoughInform(req.body);
  if (typeMissing)
    return sendRes(`Missing ${typeMissing} in post body`, res, 400);
  const messageInvalid = checkValid(req.body);
  if (messageInvalid) return sendRes(messageInvalid, res, 400);
  const userExist = await UserInform.findOne(
    { email: req.body.email },
    { email: 1 }
  );
  if (userExist) return sendRes("This email is already signed in", res, 200);
  const hashPass = await bcrypt.hash(
    req.body.password,
    Number(process.env.SALT_PASS)
  );
  const userInform = new UserInform({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashPass,
    email: req.body.email,
    country: req.body.country,
    phoneNumber: req.body.phoneNumber || "",
  });
  if (!req.body.isTest) {
    userInform
      .save()
      .then(console.log("Save success"))
      .catch((err) => console.log(err));
  }
  return sendRes("User successfully saved", res, 201, true, null, {
    isSaved: true,
  });
});

function sendRes(
  message,
  res,
  statusCode = 400,
  isSuccess = false,
  token = null,
  data = null
) {
  res.status(statusCode).json({
    status: statusCode,
    message,
    success: isSuccess,
    data: data,
    token: token,
  });
}

const verifiedToken = (authHeader, resolve, reject) => {
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return reject("Token not included");
  jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
    if (err) return reject("Token invalid");
    resolve(data);
  });
};

module.exports = userRouter;
