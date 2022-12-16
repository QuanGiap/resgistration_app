const userRouter = require('express').Router();
const setAttribute = require('../tools/setAttribute')
const {CognitoIdentityProvider} = require('@aws-sdk/client-cognito-identity-provider');
const client = new CognitoIdentityProvider({region:'us-west-2'});
require("dotenv").config();

const {verifyToken,getToken} = require('../tools/middlewares/verifyToken');

/*
    Allow user to get their info
    Require: AccessToken from header (string);
*/
userRouter.get('/info',async (req,res,next)=>{
    try{
        const token = getToken(req);
        const params = {
            AccessToken:token,
        }
        const result = await client.getUser(params);
        res.json(result);
    }catch(err){
        next(err);
    }
})
/*
    Allow user to update their info
    Require: AccessToken from header (string);
    Optional: Address (string),Nickname (string),Birthdate (string),Gender (string),LastName (string)
    Note: If leave empty string in optional value, it will delete that value of the user
*/
userRouter.patch('/info',async (req,res,next)=>{
    try{
        const token = getToken(req);
        const attributes = setAttribute(req);
        const params = {
            AccessToken:token,
            UserAttributes:attributes
        }
        const result = await client.updateUserAttributes(params);
        res.json(result);
    }catch(err){
        next(err);
    }
})
/*
    Delete their account by themself
    Require: AccessToken from header (string);
*/
userRouter.delete('/',async (req,res,next)=>{
    try{
        const token = getToken(req);
        const params = {
            AccessToken:token
        }
        const result = await client.deleteUser(params);
        res.json(result);
    }catch(err){
        next(err);
    }
})
/*
    Allow user to change password
    Require: AccessToken from header (string),PreviousPassword (string), ProposedPassword (string)
*/
userRouter.patch("/change_password",async(req,res,next)=>{
    try{
    const token = getToken(req);
    const params = {
        AccessToken:token,
        PreviousPassword: req.body.PreviousPassword,
        ProposedPassword: req.body.ProposedPassword
    } 
    const result = await client.changePassword(params);
    res.json({message:"Change success"});
    }catch(err){
        next(err);
    }
})
module.exports = userRouter;