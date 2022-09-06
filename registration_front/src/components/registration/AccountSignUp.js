import React from "react";
import { TextField, Grid } from "@mui/material";
const SPECIAL_CHAR = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

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

const checkValidAccount = (email, password, repassword, setErrorText) => {
  if (!email) {
    setErrorText("Email is required");
    return false;
  }
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
  setErrorText("");
  return true;
};
export { checkValidAccount };
