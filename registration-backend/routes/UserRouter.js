const userRouter = require("express").Router();
const checkObj = require('../tools/checkValidInform');
const checkValid = checkObj.checkValid;
const checkEnoughInform = checkObj.checkEnoughInform;
const bcrypt = require('bcrypt');
const UserInform = require('../schemas/UserSchema');
const jwt = require('jsonwebtoken');
const sendVerifyEmail = require('../tools/sendMail').sendVerifyEmail;
const generatePass = require('../tools/generateRandomPassword');
let accountVerifycation={};
userRouter.patch("/update",async function (req,res,next){
  verifiedToken(req.headers.authorization,async (data)=>{
    const original = await UserInform.findByIdAndUpdate(data.id,{
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      country:req.body.country,
      email:req.body.email,
      phoneNumber:req.body.phoneNumber
    });
    if(!original) return sendRes("This account id not exist in data base",res)
    return res.status(200).json({
      message:"Update success",
      OriginData:original,
    })
  },(message)=>sendRes(message,res,400))
})

//default is /user/signin
userRouter.post("/signin", async function (req, res, next) {
    if(!req.body.email||!req.body.password) return sendRes("Missing email or password in body post", res, 400);
    const userExist = await UserInform.findOne({email:req.body.email},{password:1,_id:1,hasVerified:1});
    if(!userExist) return sendRes("This email not exist", res, 200);
    const isTheSame = await bcrypt.compare(req.body.password,userExist.password);
    if(!isTheSame) return sendRes("wrong password", res, 200);
    const token = jwt.sign({id:userExist._id},process.env.SECRET_KEY);
    return sendRes("Login success",res,200,true,token);
  }
)

userRouter.get("/getData", async function (req, res, next) {
  verifiedToken(req.headers.authorization,async (data)=>{
    const userInform = await UserInform.findById(data.id);
    if(!userInform) return sendRes("Cannot find the data follow your Id",res,400,false);
    if(!userInform.hasVerified) return sendRes("Your email is not verified please verify first",res,200,false);
    return res.status(200).json({
      message:"token valid",
      userData:userInform
    })
  },(message)=>sendRes(message,res));
})

userRouter.post('/generate_verify_code',(req,res,next)=>{
  if(!req.body.email) return sendRes('mail not included',400);
  const code = generatePass(8);
  accountVerifycation[req.body.email] = code;
  // console.log(req.body.email);
  sendVerifyEmail(req.body.email,code);
  setTimeout(()=>{
    delete accountVerifycation[req.body.email];
  },60000)
  return sendRes("sended validation code",res,200,true);
})

userRouter.post('/verify_code',async (req,res,next)=>{
    if(!req.body.email) return sendRes('mail not included',400);
    if(accountVerifycation[req.body.email] != req.body.verificationCode) return sendRes("Verify code is not correct or expired",res,200);
    delete accountVerifycation[req.body.email];
    const origin = await UserInform.findOneAndUpdate({email:req.body.email},{
      hasVerified:true
    })
    if(!origin) return sendRes("Verify error",res,400);
    return sendRes("Verify successfully",res,200,true);
})
//default is /user/create
userRouter.post("/create", async function (req, res, next) {
  // if(!req.body.verificationCode){
  //   return sendRes("verify code not in body POST",res,400);
  // }
  // if(accountVerifycation[req.body.email] != req.body.verificationCode) return sendRes("Verify code is not correct or expired",res,200);
  // delete accountVerifycation[req.body.email];
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
  if(!req.body.isTest){userInform.save().then(console.log("Save success")).catch(err=>console.log(err));}
  return sendRes("User successfully saved",res,201,true);
});

function sendRes(message, res, statusCode = 400,isSuccess = false,token=null) {
  res.status(statusCode).json({
    status: statusCode,
    message,
    success:isSuccess,
    token:token
  });
}

const verifiedToken = ((authHeader,resolve, reject) => {
  const token = authHeader && authHeader.split(" ")[1];
  if(!token) reject("Token not included");
  jwt.verify(token,process.env.SECRET_KEY,async (err,data)=>{
    if(err) reject("Token invalid");
    resolve(data);
  })
});

module.exports = userRouter;
