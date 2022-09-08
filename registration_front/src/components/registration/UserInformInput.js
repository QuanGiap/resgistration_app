import React from "react";
import { Grid, TextField } from "@mui/material";
const COUNTRY_CODE =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BH BS BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI KH CM CA CV KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU  GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MK MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SZ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW";
export default function UserInformInput(props) {
  return (
    <div>
      <Grid container spacing={1} justifyContent="center">
        <Grid item xs={8}>
          <TextField
            fullWidth
            label="First name (required)"
            value={props.firstName}
            onChange={(e) => props.setFirstName(e.target.value)}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            fullWidth
            label="Last name (required)"
            value={props.lastName}
            onChange={(e) => props.setLastName(e.target.value)}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            fullWidth
            label="Country (required)"
            value={props.country}
            onChange={(e) => props.setCountry(e.target.value)}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            fullWidth
            label="Phone Number"
            value={props.phoneNumber}
            onChange={(e) => props.setPhoneNumber(e.target.value)}
          />
        </Grid>
      </Grid>
    </div>
  );
}
const checkUserInform = (
  firstName,
  lastName,
  country,
  phoneNumber,
  setErrorText
) => {
  if (!firstName) {
    setErrorText("Missing first name");
    return false;
  }
  if (!lastName) {
    setErrorText("Missing last name");
    return false;
  }
  if (!country) {
    setErrorText("Missing country code");
    return false;
  }
  if (country.length !== 2) {
    setErrorText("Country code has only 2 letters");
    return false;
  }
  if (COUNTRY_CODE.indexOf(country) === -1) {
    setErrorText("Country code invalid");
    return false;
  }
  if (phoneNumber && phoneNumber.length < 8) {
    setErrorText("Phone number length is not long enough");
    return false;
  }
  if (!enoughStringLength(firstName, 2, 15)) {
    setErrorText("First name is not long enough");
    return false;
  }
  if (!enoughStringLength(lastName, 2, 15)) {
    setErrorText("Last name is not long enough");
    return false;
  }
  setErrorText("");
  return true;
};

const enoughStringLength = (str, min = 0, max) => {
  return str.length >= min && str.length <= max;
};
export {checkUserInform};
