import React from "react";
import { TextField, Grid } from "@mui/material";
const SPECIAL_CHAR = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
const SPECIAL_CHAR_EMAIL_INVALID_PREFIX = /[`!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/;
const SPECIAL_CHAR_EMAIL_INVALID_DOMAIN = /[`!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
const SPECIAL_CHAR_EMAIL_VALID = '_-.';

export default function AccountSignUp(props) {
  return (
    <div>
      <Grid container spacing={1} justifyContent="center">
        <Grid item xs={8}>
          <TextField
            fullWidth
            label="Your email"
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            type="password"
            fullWidth
            label="Password"
            value={props.password}
            onChange={(e) => props.setPassword(e.target.value)}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            type="password"
            fullWidth
            label="Type your password again"
            value={props.repassword}
            onChange={(e) => props.setRepassword(e.target.value)}
          />
        </Grid>
      </Grid>
    </div>
  );
}

function checkSpecialCharStr(str,type){
  // Allowed characters: letters (a-z), numbers, dashes (and underscores, periods if prefix).
  if(type === 1 && SPECIAL_CHAR_EMAIL_INVALID_PREFIX.test(str)) return false;
  if(type === 2){
    const arrStr = str.split('.');
    if(arrStr.length !== 2) return false;
    if(arrStr[1].length<2) return false;
    if(SPECIAL_CHAR_EMAIL_INVALID_DOMAIN.test(arrStr[0])) return false;
    str = arrStr[0];
  }
  //  An underscore, period, or dash must be followed by one or more letter or number.
  if(SPECIAL_CHAR_EMAIL_VALID.indexOf(str[0])!==-1||SPECIAL_CHAR_EMAIL_VALID.indexOf(str[str.length-1])!==-1) return false;
  for(let i = 1;i<str.length;i++){
    const character = str[i];
    const beforeChar = str[i-1];
    if(SPECIAL_CHAR_EMAIL_VALID.indexOf(character)!==-1 && SPECIAL_CHAR_EMAIL_VALID.indexOf(beforeChar)!==-1){
      return false;
    }
  }
  return true;
}
const checkValidAccount = (email, password, repassword, setErrorText) => {
  if (!email) {
    setErrorText("Email is required");
    return false;
  }
  //check password secure
  if (password.length < 12) {
    setErrorText("Password is not long enough");
    return false;
  }
  let isLower = false;
  let isUpper = false;
  const isSpecial = SPECIAL_CHAR.test(password);
  let isNumber = false;
  for (let i = 0; i < password.length && !isUpper; i++) {
    const character = password[i];
    const charCode = character.charCodeAt(0);
    if (charCode>=65 && charCode<=90) {
      isUpper = true;
    }
  }
  for (let i = 0; i < password.length && !isLower; i++) {
    const character = password[i];
    const charCode = character.charCodeAt(0);
    if (charCode>=97 && charCode<=122) {
      isLower = true;
    }
  }
  for (let i = 0; i < password.length && !isNumber; i++) {
    let character = password[i];
    if (!isNaN(character)) {
      isNumber = true;
    }
  }
  if (!isLower) {
    setErrorText("Missing lower case character in password");
    return false;
  }
  if (!isUpper) {
    setErrorText("Missing upper case character in password");
    return false;
  }
  if (!isSpecial) {
    setErrorText("Missing special character in password");
    return false;
  }
  if (!isNumber) {
    setErrorText("Missing number character in password");
    return false;
  }
  if (password !== repassword) {
    setErrorText("Password and repassword are not the same");
    return false;
  }
  //check email valid
  const arrStr = email.split('@');
  if(arrStr.length!==2) {
    setErrorText("email invalid");
    return false;
  }
  const prefix = arrStr[0];
  const domain = arrStr[1];
  if(prefix.length<2||domain.length<2){
    setErrorText("email is not long enough and/or is invalid");
    return false;
  }
  if(!checkSpecialCharStr(prefix,1) || !checkSpecialCharStr(domain,2)) {
    setErrorText("email invalid");
    return false;
  }
  setErrorText("");
  return true;
};
export { checkValidAccount };
