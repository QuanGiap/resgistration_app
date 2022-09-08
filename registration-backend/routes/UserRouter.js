const userRouter = require("express").Router();
const checkObj = require('../tools/checkValidInform');
const checkValid = checkObj.checkValid;
const checkEnoughInform = checkObj.checkEnoughInform;
const bcrypt = require('bcrypt');
const UserInform = require('../schemas/UserSchema');
const jwt = require('jsonwebtoken');
const user = require("../schemas/UserSchema");
const sendEmail = require('../tools/sendMail');
const generatePass = require('../tools/generateRandomPassword');
let accountVerifycation={};
userRouter.patch("/update",async function (req,res,next){
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if(!token) return res.sendStatus(401);
  jwt.verify(token,process.env.SECRET_KEY,async(err,data)=>{
    if(err) return res.status(403).json({message:err.message});
    const userInform = await UserInform.findById(data.id,{firstName:1});
    const original = await UserInform.findByIdAndUpdate(data.id,{
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      country:req.body.country,
      email:req.body.email,
      phoneNumber:req.body.phoneNumber
    });
    return res.status(200).json({
      message:"token valid",
      OriginData:original,
    })
  });
})

//default is /user/signin
userRouter.post("/signin", async function (req, res, next) {
    if(!req.body.email||!req.body.password) return sendRes("Missing email or password in body post", res, 400);
    const userExist = await UserInform.findOne({email:req.body.email},{password:1,_id:1});
    if(!userExist) return sendRes("This email not exist", res, 200);
    const isTheSame = await bcrypt.compare(req.body.password,userExist.password);
    if(!isTheSame) return sendRes("wrong password", res, 200);
    const token = jwt.sign({id:userExist._id},process.env.SECRET_KEY);
    return sendRes("Login success",res,200,true,token);
  }
)
userRouter.post('/generate_verify_code',(req,res,next)=>{
  if(!req.body.email) return sendRes('mail not included',400);
  const code = generatePass(8);
  accountVerifycation[req.body.email] = code;
  console.log(req.body.email);
  sendEmail(req.body.email,code);
  setTimeout(()=>{
    delete accountVerifycation[req.body.email];
  },60000)
  return sendRes("sended validation code",res,200,true);
})
//default is /user/create
userRouter.post("/create", async function (req, res, next) {
  if(!req.body.verificationCode){
    return sendRes("verify code not in body POST",res,400);
  }
  if(accountVerifycation[req.body.email] != req.body.verificationCode) return sendRes("Verify code is not correct or expired",res,200);
  delete accountVerifycation[req.body.email];
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

module.exports = userRouter;
