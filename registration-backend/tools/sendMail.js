let client = require('@sendgrid/mail')
require('dotenv').config();
client.setApiKey(process.env.SEND_GRID_API_KEY);

const sendVerifyEmail = (email,code) => client.send({
    to:{
        email:email,
        name:"Jayson"
    },
    from:{
        email:process.env.MY_SECRET_EMAIL,
        name:"Verification server"
    },
    subject:"Your verify code is "+code,
    templateId:process.env.MY_TEMPLATE_ID,
    dynamicTemplateData:{
        code:code
    }
}).then(()=>console.log("Email sended")).catch(err=>console.log(err.message));

module.exports = {sendVerifyEmail:sendVerifyEmail};