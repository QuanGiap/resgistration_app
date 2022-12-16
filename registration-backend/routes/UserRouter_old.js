const userRouter = require("express").Router();
require('dotenv').config();
const checkObj = require("../tools/checkValidInform");
const checkValidFunct = checkObj.checkValid;
const checkEnoughInformFunct = checkObj.checkEnoughInform;
const checkPassSecureFunct = checkObj.checkPassSecure;
const verifyToken = require("../tools/middlewares/verifyToken").verifyToken;
const sendRes = require("../tools/middlewares/verifyToken").sendRes;
const bcrypt = require("bcrypt");
// const db = require("../tools/mySQLConnetion");
// const UserInform = require("../schemas/UserSchema");
// const userRepo = require("../Repo/UserRepo");
const jwt = require("jsonwebtoken");
const sendVerifyEmail = require("../tools/sendMail").sendVerifyEmail;
const generatePass = require("../tools/generateRandomPassword");
const {
  queryPromise,
  QUERY_FIND_BY_USER_ID,
  QUERY_FIND_BY_EMAIL,
  QUERY_UPDATE_VERIFYCODE_BY_EMAIL,
  QUERY_UPDATE_VERIFYCODE_USER_ID,
  QUERY_UPDATE_VERIFY_EMAIL_BY_USER_ID,
  QUERY_FIND_CODE_BY_USER_ID,
  QUERY_RESET_CODE_BY_CODE_ID,
  QUERY_UPDATE_USER_INFORM_BY_USER_ID
} = require("../tools/mySQLQuery");
// const { query } = require("../tools/mySQLConnetion");
const MAX_TIMEOUT_VERIFY_CODE = 60; //60 seconds

userRouter.patch(
  "/update_user_inform",
  verifyToken,
  async function (req, res, next) {
    try {
     const result = await queryPromise(QUERY_FIND_BY_USER_ID, [req.dataToken.personId]);
      if (result.length == 0)
       throw({message:"Your data is not found in our data", status_code:200});
      await queryPromise(
        QUERY_UPDATE_USER_INFORM_BY_USER_ID,
        [
          req.body.firstName,
          req.body.lastName,
          req.body.country,
          req.body.phoneNumber,
          req.dataToken.personId,
        ]);
          return sendRes("Update success", res, 200, true, null);
    } catch (err) {
      next(err);
    }
  }
);

//default is /user/sign_in
userRouter.post("/sign_in", async (req, res, next) => {
  try {
    if (!req.body.email)
      return sendRes("Missing email", res, 400);
    if (!req.body.password)
    return sendRes("Missing password", res, 400);
    const result = await queryPromise(QUERY_FIND_BY_EMAIL, [req.body.email]);
    if (result.length == 0) return sendRes("This email not exist", res, 200);
    const isTheSame = await bcrypt.compare(
      req.body.password,
      result[0].password
    );
    if (!isTheSame) return sendRes("wrong password", res, 200);
    const token = jwt.sign({ personId: result[0].personId }, process.env.SECRET_KEY);
    return sendRes("Login success", res, 200, true, token);
  } catch (err) {
    next(err);
  }
});

userRouter.get("/get_user_info", verifyToken, async function (req, res, next) {
  try {
    const result = await queryPromise(QUERY_FIND_BY_USER_ID, [req.dataToken.personId]);
    if (result.length == 0)
      return sendRes("Cannot find the data by your Id", res, 200, false);
    return res.status(200).json({
      message: "token valid",
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
userRouter.post("/generate_verify_code", async (req, res, next) => {
  try {
        if (!req.body.email) throw {message:"email not included",status_code:400};
    const code = generatePass(8);
    const result = await queryPromise(QUERY_FIND_BY_EMAIL, [req.body.email]);
    if (result.length == 0)
      throw {
        message: "this email is not found in our data",
        status_code: 200
      };
    if (result[0].hasVerified)
      throw {
        message: "this email is already verified",
        status_code: 200
      };
    const updateResult = await queryPromise(QUERY_UPDATE_VERIFYCODE_BY_EMAIL, [
      code.toString(),
      "VERIFY_EMAIL",
      "",
      req.body.email,
    ]);
    sendVerifyEmail(req.body.email, code);
    return sendRes("sended validation code", res, 200, false, null, {
      hasSended: true,
    });
  } catch (err) {
    next(err);
  }
});

userRouter.post(
  "/generate_verify_code_new_email",
  verifyToken,
  async (req, res, next) => {
    try {
      if (!req.body.email)
        throw {
          message: "New email not included",
          status_code: 400
        };
      const code = generatePass(8);
      const userExist = await queryPromise(QUERY_FIND_BY_EMAIL, [
        req.body.email,
      ]);
      if (userExist.length != 0)
        throw {
          message: "This email is already existed",
          status_code: 200
        };
      const resultUpdate = await queryPromise(QUERY_UPDATE_VERIFYCODE_USER_ID, [
        code.toString(),
        "VERIFY_NEW_EMAIL",
        req.body.email,
        req.dataToken.personId,
      ]);
      sendVerifyEmail(req.body.email, code);
      return sendRes("sended validation code", res, 200, true, null, {
        hasSended: true,
      });
    } catch (e) {
      next(e);
    }
  }
);
userRouter.post(
  "/generate_verify_code_change_password",
  async (req, res, next) => {
    try {
      if (!req.body.email)
        throw {
          message: "Email not included",
          status_code: 400
        };
      const code = generatePass(8);
      const resultUpdate = await queryPromise(
        QUERY_UPDATE_VERIFYCODE_BY_EMAIL,
        [code.toString(), "PASSWORD_CHANGE", null, req.body.email]
      );
      if (resultUpdate.affectedRows == 0)
        throw {
          message: "This email not found in our data",
          status_code: 200
        };
      sendVerifyEmail(req.body.email, code);
      return sendRes("sended validation code", res, 200, true, null, {
        hasSended: true,
      });
    } catch (e) {
      next(e);
    }
  }
);

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
userRouter.patch(
  "/verify_code_new_email",
  verifyToken,
  async (req, res, next) => {
    try {
      if (!req.body.email)
        throw {
          message: "New email not included",
          status_code: 400
        };

      if (!req.body.verificationCode)
        throw {
          message: "Verication code not included",
          status_code: 400
        };

      const user = await queryPromise(QUERY_FIND_BY_USER_ID, [req.dataToken.personId]);

      if (user.length == 0)
        throw {
          message: "Email that need to change not found",
          status_code: 400
        };

      const userCode = await queryPromise(QUERY_FIND_CODE_BY_USER_ID, [
        req.dataToken.personId,
      ]);
      // console.log(userCode[0]);
      if (userCode[0].codeType != "VERIFY_NEW_EMAIL")
        throw {
          message: "This code type is not suitable for verify new email",
          status_code: 400
        };

      if (req.body.verificationCode != userCode[0].code)
        throw {
          message: "Your verication code is invalid",
          status_code: 200
        };

      if (req.body.email != userCode[0].newEmail)
        throw {
          message:
            "This new email is not the same with the email just got verication code.",
          status_code: 200
        };

      if (
        Date.now() / 1000 - userCode[0].lastUpdateInSecond >
        MAX_TIMEOUT_VERIFY_CODE
      )
        throw {
          message: "This verify code is expired",
          status_code: 200
        };
      const queryUpdateEmail =
        "UPDATE sql_shop_data.users_info SET email = ? WHERE person_id = ?;";
      const resultUpdate = await queryPromise(queryUpdateEmail, [
        req.body.email,
        req.dataToken.personId,
      ]);
      // console.log(resultUpdate)
      // const resultResetCode = await queryPromise(QUERY_RESET_CODE_BY_CODE_ID, [
      //   userCode[0].codeId,
      // ]);
      await queryPromise(QUERY_RESET_CODE_BY_CODE_ID, [userCode[0].codeId]);
      sendRes("Change email success", res, 200, true, null, {
        verifySuccess: true,
      });
    } catch (e) {
      next(e);
    }
  }
);

userRouter.patch("/verify_code_email", async (req, res, next) => {
  try {
    if (!req.body.email)
      throw { message: "Email not included", success: false, status_code: 400 };

    if (!req.body.verificationCode)
      throw {
        message: "Verication code not included",
        status_code: 400
      };

    const emailExist = await queryPromise(QUERY_FIND_BY_EMAIL, [req.body.email]);
    if (emailExist.length == 0)
      throw { message: "Your email not found",status_code: 200 };
    const codeUser = await queryPromise(QUERY_FIND_CODE_BY_USER_ID, [emailExist[0].personId]);
    if (codeUser.length == 0)
      throw {
        message: "Unable to find your code",
        status_code: 200
      };
    if (codeUser[0].codeType != "VERIFY_EMAIL")
      throw {
        message: "This code type is not correct to verify the email",
        status_code: 200
      };
    if (codeUser[0].code != req.body.verificationCode)
      throw {
        message: "Your verication code invalid",
        status_code: 200,
      };
    if (
      Date.now() / 1000 - codeUser[0].lastUpdateInSecond >
      MAX_TIMEOUT_VERIFY_CODE
    )
      throw {
        message: "Your verication code is expired",
        status_code: 200
      };

    await queryPromise(QUERY_RESET_CODE_BY_CODE_ID, [codeUser[0].codeId]);
    const resultVerify = await queryPromise(
      QUERY_UPDATE_VERIFY_EMAIL_BY_USER_ID,
      [emailExist[0].personId]
    );
    return sendRes("Verify successfully", res, 200, false, null, {
      verifySuccess: true,
    });
  } catch (e) {
    next(e);
  }
});
userRouter.patch("/verify_code_change_password", async (req, res, next) => {
  try {
    if (!req.body.email)
      throw { message: "Email not included", success: false, status_code: 400 };

    if (!req.body.password)
      throw {
        message: "New password not included",
        status_code: 400
      };

    if (!req.body.verificationCode)
      throw {
        message: "Verication code not included",
        status_code: 400
      };
    const errorPass = checkPassSecureFunct(req.body.password);
    if (errorPass)
      throw { message: errorPass, success: false, status_code: 200 };

    const userInfo = await queryPromise(QUERY_FIND_BY_EMAIL, [req.body.email]);
    const userCode = await queryPromise(QUERY_FIND_CODE_BY_USER_ID, [
      userInfo[0]?.personId || -1,
    ]);

    if (userCode.length == 0)
      throw {
        message: "code not found in our data",
        success: false,
        status_code: 200,
      };
    if (userCode[0].codeType !== "PASSWORD_CHANGE")
      throw { message: "This code is not suitable for this type", status_code: 200 };
    if (userCode[0].code != req.body.verificationCode)
      throw { message: "Code invalid", status_code: 200 };
    if (
      Date.now() / 1000 - userCode[0].lastUpdateInSecond >
      MAX_TIMEOUT_VERIFY_CODE
    )
      throw {
        message: "Your verication code is expired",
        status_code: 200,
      };
    const hashPass = await bcrypt.hash(
      req.body.password,
      Number(process.env.SALT_PASS)
    );
    const QUERY_UPDATE_PASSWORD_BY_USERID =
      "UPDATE sql_shop_data.users_info SET password = ? WHERE person_id = ?";
    const resultUpdate = await queryPromise(QUERY_UPDATE_PASSWORD_BY_USERID, [
      hashPass,
      userInfo[0].personId,
    ]);
    if (resultUpdate.affectedRows == 0)
      throw { message: "Update error", status_code: 200 };
    await queryPromise(QUERY_RESET_CODE_BY_CODE_ID, [userCode[0].codeId]);
    return sendRes("Verify success", res, 200, false, null, {
      verifySuccess: true,
    });
  } catch (e) {
    next(e);
  }
});
userRouter.post("/check_account_exist", async (req, res, next) => {
  if (!req.body.email) return sendRes("Email not included", res, 400);
  const userExist = await queryPromise(QUERY_FIND_BY_EMAIL, [req.body.email]);
  if (userExist.length != 0)
    return sendRes("This email is already signed in", res, 200, true, null, {
      isExist: true,
    });
  return sendRes("This email not in data base", res, 200, true, null, {
    isExist: false,
  });
});
// default is /user/create
userRouter.post("/create", async (req, res, next) => {
  try {
    const typeMissing = checkEnoughInformFunct(req.body);
    const queryInsertNewUser =
      "INSERT sql_shop_data.users_info (last_name,first_name,country,phone_number,email,password) VALUES (?,?,?,?,?,?);";
    if (typeMissing)
      throw {message: `Missing ${typeMissing} in post body`, status_code:400};
    const messageInvalid = checkValidFunct(req.body);
    if (messageInvalid) throw {message: messageInvalid,status_code: 400};
    const result = await queryPromise(QUERY_FIND_BY_EMAIL, [req.body.email]);
    if (result.length != 0)
      throw {message: "This email is already signed in",status_code:400};
    const hashPass = await bcrypt.hash(
      req.body.password,
      Number(process.env.SALT_PASS)
    );
    const resultInsert = await queryPromise(queryInsertNewUser, [
      req.body.lastName,
      req.body.firstName,
      req.body.country,
      req.body.phoneNumber,
      req.body.email,
      hashPass,
    ]);
    return sendRes("User successfully saved", res, 201, true, null, {
      isSaved: true,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;
