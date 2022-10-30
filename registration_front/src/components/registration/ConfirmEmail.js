import React from 'react'
import CheckIcon from '@mui/icons-material/Check';
import { Grid,TextField,Button } from '@mui/material'
import axios from 'axios';
export default function ConfirmEmail(props) {
  const sendVerifyCode = async () =>{
    axios.post("http://localhost:5000/user/generate_verify_code",{
      email:props.email
    }).then(res=>{
      if(!res.data.success) return props.setTextAnnounce("Code send unsuccess")
      props.setTextAnnounce("Verify code sended in your email. Please type the code in text field")
    }).catch(err=>{props.setTextAnnounce(err.response.data?.message || err.message)});
  }
  const verifyCode = async () =>{
   axios.patch("http://localhost:5000/user/verify_code",{
      email:props.email,
      verificationCode:props.codeVerify
    }).then(res=>{
      console.log(res);
      if(!res.data.success || !res.data.data.verifySuccess) return props.setTextAnnounce("Verify failed");
      props.setTextAnnounce("Verify successfully");
      props.setVerify(true);
    }).catch(err=>{props.setTextAnnounce(err.response.data.message)});
  }
  return (
    <Grid container style={{padding:"20px"}}>
        <Grid item xs={8}>
          <TextField
          disabled={props.isVerified}
            fullWidth
            variant="filled"
            label="Input the verify code"
            value={props.codeVerify}
            onChange={(e) => props.setCodeVerify(e.target.value)}
          />
        </Grid>
        {!props.isSended && <Grid item xs={2}>
          <Button disabled={props.isVerified} variant='outlined' onClick={()=>{props.setSend();sendVerifyCode()}}>Send code</Button>
        </Grid>}
        <Grid item xs={2}>
        <Button disabled={props.isVerified} variant='contained' onClick={verifyCode}>Verify</Button>
        {props.isVerified && <CheckIcon/>}
        </Grid>
      </Grid>
  )
}
