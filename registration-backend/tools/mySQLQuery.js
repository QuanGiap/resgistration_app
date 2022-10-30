const db = require("./mySQLConnetion");
const QUERY_FIND_BY_ID =
  "SELECT has_verified,first_name,last_name,country,phone_number FROM sql_shop_data.users_info WHERE person_id = ?";
const QUERY_FIND_BY_EMAIL =
  "SELECT password,has_verified AS 'hasVerified',person_id AS 'personId' FROM sql_shop_data.users_info WHERE email = ?";
const QUERY_UPDATE_VERIFYCODE_BY_EMAIL =
  "UPDATE sql_shop_data.verify_code_users SET code = ?, code_type = ?,new_email_change = COALESCE(?,new_email_change) WHERE person_id = (SELECT person_id FROM sql_shop_data.users_info WHERE email = ?);";
const QUERY_UPDATE_VERIFYCODE_USER_ID =
  "UPDATE sql_shop_data.verify_code_users SET code = ?, code_type = ?,new_email_change = COALESCE(?,new_email_change) WHERE person_id = ?;";
const QUERY_UPDATE_VERIFY_EMAIL_BY_USER_ID =
  "UPDATE sql_shop_data.users_info SET has_verified = 1 WHERE person_id = ?;";
const QUERY_FIND_CODE_BY_USER_ID =
  "SELECT UNIX_TIMESTAMP(last_update) AS 'lastUpdateInSecond', code,code_type AS 'codeType',new_email_change as 'newEmail',code_id as 'codeId' FROM sql_shop_data.verify_code_users WHERE person_id = ?";
const QUERY_RESET_CODE_BY_CODE_ID =
  "UPDATE sql_shop_data.verify_code_users SET code = '', code_type = 'NONE', new_email_change = NULL WHERE code_id = ?;";

//a promise type for sql query
const queryPromise = (queryType, queryValueArray) => {
  return new Promise((resolve, reject) => {
    db.query(queryType, queryValueArray, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
};

module.exports = {queryPromise,QUERY_FIND_BY_ID,QUERY_FIND_BY_EMAIL,QUERY_UPDATE_VERIFYCODE_BY_EMAIL,QUERY_UPDATE_VERIFYCODE_USER_ID,QUERY_UPDATE_VERIFY_EMAIL_BY_USER_ID,QUERY_FIND_CODE_BY_USER_ID,QUERY_RESET_CODE_BY_CODE_ID}