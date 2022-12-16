const authRouter = require('express').Router();
const {CognitoIdentityProvider} = require('@aws-sdk/client-cognito-identity-provider');
const client = new CognitoIdentityProvider({region:'us-west-2'});

const Pooldata = {
    ClientId:process.env.CLIENT_ID,
    PoolId:process.env.POOL_ID
}
/*
    Give Access token,Refresh token and Id token to the user if sign in success
    Require: Username (string), Password (string);
*/
authRouter.post('/sign_in',async (req,res,next)=>{
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: Pooldata.ClientId,
        AuthParameters:{
            USERNAME:req.body.Username,
            PASSWORD:req.body.Password,
        }
    }
    client.initiateAuth(params,(err,data)=>{
        if(err) return next(err);
        res.json(data);
    });
})

/*
    Send email to the user with the confirm code
    Require: Username;
*/
authRouter.post('/resend_confirm_code',async(req,res,next)=>{
    const params = {
        ClientId:Pooldata.ClientId,
        Username:req.body.Username
    }
    client.resendConfirmationCode(params,(err,data)=>{
        if(err) return next(err);
        res.json(data);
    })
})

/*
    Allow user to sign up. Add user to the user pool. Send email with confirmation code to user 
    Require: Username (string), Password (string), Email (string);
*/
authRouter.post('/sign_up',(req,res,next)=>{
    const params = {
        ClientId:Pooldata.ClientId,
        Password:req.body.Password,
        Username:req.body.Username,
        UserAttributes:[{
            Name:"email",
            Value:req.body.Email
        }]
    }
    client.signUp(params,(err,data)=>{
        if(err) return next(err);
        else{
            if(data.UserConfirmed){
                res.json({message:"Sign up successfully"});
            }else{
                res.json({message:"Check email to confime your account"});
            }
        }
    })
})

/*
    Give user new Access token and Id token if refresh token given is valid
    Require: RefreshToken (string);
*/
authRouter.post('/refresh_token',(req,res,next)=>{
    const params = {
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: Pooldata.ClientId,
        AuthParameters: {
            REFRESH_TOKEN: req.body.RefreshToken,
        },
    }
    client.initiateAuth(params,(err,data)=>{
        if(err) return next(err);
        res.json(data);
    })
})
/*
    Confirm user email if confirm code is valid
    Require: Username (string), code (string);
*/
authRouter.patch('/confirm_email',(req,res,next)=>{
    const params = {
        ClientId:Pooldata.ClientId,
        ConfirmationCode:req.body.Code,
        Username:req.body.Username,
    }
    client.confirmSignUp(params,(err,data)=>{
        if(err) return next(err);
        else res.json({message:"Confirm success"});
    })
})
/*
    Allow user to change password if they forgot. Send email with code to user
    Require: Username (string);
*/
authRouter.post('/change_password',async(req,res,next)=>{
    try{
    const params = {
        ClientId: Pooldata.ClientId,
        Username: req.body.Username
    }
    const result = await client.forgotPassword(params);
    res.json(result);
    }catch(err){
        next(err);   
    }
})
/*
    Confirm user's password changed if code is valid.
    Require: Username (string), Password (string), Code (string)
*/
authRouter.post('/confirm_change_password',async(req,res,next)=>{
    try{
    const params = {
        ClientId: Pooldata.ClientId,
        Username: req.body.Username,
        Password: req.body.Password,
        ConfirmationCode: req.body.Code
    }
    const result = await client.confirmForgotPassword(params);
    res.json(result);
    }catch(err){
        next(err);   
    }
})
module.exports = authRouter;