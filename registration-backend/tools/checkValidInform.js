const SPECIAL_CHAR = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
const SPECIAL_CHAR_EMAIL_INVALID_PREFIX = /[`!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~]/;
const SPECIAL_CHAR_EMAIL_INVALID_DOMAIN = /[`!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
const SPECIAL_CHAR_EMAIL_VALID = '_-.';
const COUNTRY_CODE =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BH BS BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI KH CM CA CV KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU  GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MK MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SZ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW";


function checkValid(body) {
    if (body.phoneNumber && body.phoneNumber.length < 8) return "phone number length is not long enough";
    if (!enoughStringLength(body.firstName, 2, 15))
      return "First name is not long enough";
    if (!enoughStringLength(body.lastName, 2, 15))
      return "Last name is not long enough";
    const errorPass = checkPassSecure(body.password);
    if (errorPass) return errorPass;
    if (COUNTRY_CODE.indexOf(body.country) == -1) return "Country code not valid";
    const errorEmail = checkEmailValid(body.email);
    if(errorEmail) return errorEmail;
    return null;
  }
  
  function checkEmailValid(email){
    const arrStr = email.split('@');
    if(arrStr.length!=2) return "email invalid";
    const prefix = arrStr[0];
    const domain = arrStr[1];
    if(prefix.length<2||domain.length<2) return "email is not long enough and/or is invalid";
    if(!checkSpecialCharStr(prefix,1)) return "email invalid";
    if(!checkSpecialCharStr(domain,2)) return "email invalid";
    return null;
  }
  
  function checkPassSecure(password) {
    if (password.length < 12) return "Password is not long enough";
    let isLower = false;
    let isUpper = false;
    const isSpecial = SPECIAL_CHAR.test(password);
    let isNumber = false;
    for (let i = 0; i < password.length && !isUpper; i++) {
      character = password[i];
      const charCode = character.charCodeAt(0);
      if (charCode>=65 && charCode<=90) {
        isUpper = true;
      }
    }
    for (let i = 0; i < password.length && !isLower; i++) {
      character = password[i];
      const charCode = character.charCodeAt(0);
      if (charCode>=97 && charCode<=122) {
        isLower = true;
      }
    }
    for (let i = 0; i < password.length && !isNumber; i++) {
      character = password[i];
      if (!isNaN(character)) {
        isNumber = true;
      }
    }
    if (!isLower) return "Missing lower case character in password";
    if (!isUpper) return "Missing upper case character in password";
    if (!isSpecial) return "Missing special character in password";
    if (!isNumber) return "Missing number character in password";
    return null;
  }
  
  function checkEnoughInform(body) {
    if (!body.firstName) return "firstName";
    if (!body.lastName) return "lastName";
    if (!body.password) return "password";
    if (!body.email) return "email";
    if (!body.country) return "country";
    return null;
}

function enoughStringLength(str, min = 1, max) {
    return str.length >= min && str.length <= max;
  }
  
  function checkSpecialCharStr(str,type){
    // Allowed characters: letters (a-z), numbers, underscores, periods, and dashes.
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

module.exports.checkEnoughInform = checkEnoughInform;
module.exports.checkValid = checkValid;