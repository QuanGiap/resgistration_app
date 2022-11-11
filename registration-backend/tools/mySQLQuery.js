const db = require("./mySQLConnetion");
//user inform query
const QUERY_FIND_BY_USER_ID =
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
const QUERY_UPDATE_USER_INFORM_BY_USER_ID =
  "UPDATE sql_shop_data.users_info SET first_name = COALESCE(?,first_name),last_name = COALESCE(?,last_name),country = COALESCE(?,country),phone_number = COALESCE(?,phone_number) WHERE person_id = ?;";

//cart query
const QUERY_CREATE_NEW_CART_BY_USER_ID = "INSERT INTO sql_shop_data.carts (person_id) VALUES (?);";
const QUERY_GET_A_CART_BY_CART_ID = "SELECT * FROM  sql_shop_data.carts WHERE cart_id = ?;";
const QUERY_GET_ALL_TOP_CARTS_WITH_AMOUNT_BY_USER_ID = "SELECT * FROM  sql_shop_data.carts WHERE person_id = ? ORDER BY cart_id DESC LIMIT ? OFFSET ?;";
const QUERY_DELETE_CART_BY_CART_ID = "DELETE FROM sql_shop_data.carts WHERE cart_id=?;";
const QUERY_UPDATE_CONFIRME_ORDER_BY_CART_ID = "UPDATE sql_shop_data.carts SET is_ordered = ? WHERE cart_id = ?;"

//line_item query
const QUERY_CREATE_NEW_LINE_ITEM_BY_PRODUCT_ID_AND_CART_ID_AND_QUANITY = "INSERT INTO sql_shop_data.line_items (cart_id,product_id,quanity) VALUES (?,?,?);";
const QUERY_GET_LINE_ITEMS_BY_CART_ID_WITH_AMOUNT = "SELECT * FROM sql_shop_data.line_items WHERE cart_id= ? LIMIT ? OFFSET ?;"
const QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID = "SELECT * FROM sql_shop_data.line_items WHERE item_id = ?;"
const QUERY_UPDATE_LINE_ITEMS_QUANITY_BY_LINE_ITEM_ID = "UPDATE sql_shop_data.line_items SET quanity = ? WHERE item_id = ?;"
const QUERY_UPDATE_LINE_ITEMS_TOTAL_PRICE_BY_LINE_ITEM_ID = "UPDATE sql_shop_data.line_items SET total_price = ? WHERE item_id = ?;"

//product query
const QUERY_GET_PRODUCTS_BY_PRODUCT_ID = "SELECT * FROM sql_shop_data.products WHERE product_id = ?;"
const QUERY_INSERT_NEW_PRODUCT_WITH_PERSONID_NAME_DESCRIBE_PRICE_DISCOUNT_QUANITY = "INSERT INTO sql_shop_data.products (person_id,product_name,product_describe,product_price,product_discount,product_quantity) VALUES (?,?,?,?,?,?);"
const QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID = "UPDATE sql_shop_data.products SET product_name = COALESCE(?,product_name),product_describe = COALESCE(?,product_describe),product_price = COALESCE(?,product_price),product_discount = COALESCE(?,product_discount),product_quantity = COALESCE(?,product_quantity) WHERE product_id = ?;"

//order query
const QUERY_INSERT_NEW_ORDER_WITH_CART_ID_AND_PERSON_ID = "INSERT INTO sql_shop_data.orders (cart_id,person_id) VALUES (?,?);";
const QUERY_GET_ORDER_BY_ORDER_ID = "SELECT * WHERE order_id = ?";
const QUERY_GET_ORDER_BY_CART_ID = "SELECT * WHERE cart_id = ?";
const QUERY_GET_ORDERS_BY_PERSON_ID = "SELECT * WHERE person_id = ?";
//a promise type for sql query
const queryPromise = (queryType, queryValueArray) => {
  return new Promise((resolve, reject) => {
    db.query(queryType, queryValueArray, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
};

module.exports = {
  queryPromise,
  QUERY_FIND_BY_USER_ID,
  QUERY_FIND_BY_EMAIL,
  QUERY_UPDATE_VERIFYCODE_BY_EMAIL,
  QUERY_UPDATE_VERIFYCODE_USER_ID,
  QUERY_UPDATE_VERIFY_EMAIL_BY_USER_ID,
  QUERY_FIND_CODE_BY_USER_ID,
  QUERY_RESET_CODE_BY_CODE_ID,
  QUERY_UPDATE_USER_INFORM_BY_USER_ID,
  QUERY_CREATE_NEW_CART_BY_USER_ID,
  QUERY_GET_ALL_TOP_CARTS_WITH_AMOUNT_BY_USER_ID,
  QUERY_DELETE_CART_BY_CART_ID,
  QUERY_GET_A_CART_BY_CART_ID,
  QUERY_UPDATE_CONFIRME_ORDER_BY_CART_ID,
  QUERY_CREATE_NEW_LINE_ITEM_BY_PRODUCT_ID_AND_CART_ID_AND_QUANITY,
  QUERY_GET_LINE_ITEMS_BY_CART_ID_WITH_AMOUNT,
  QUERY_UPDATE_LINE_ITEMS_QUANITY_BY_LINE_ITEM_ID,
  QUERY_UPDATE_LINE_ITEMS_TOTAL_PRICE_BY_LINE_ITEM_ID,
  QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,
  QUERY_GET_PRODUCTS_BY_PRODUCT_ID,
  QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID,
  QUERY_INSERT_NEW_PRODUCT_WITH_PERSONID_NAME_DESCRIBE_PRICE_DISCOUNT_QUANITY,
  QUERY_GET_ORDERS_BY_PERSON_ID,
  QUERY_GET_ORDER_BY_CART_ID,
  QUERY_GET_ORDER_BY_ORDER_ID,
  QUERY_INSERT_NEW_ORDER_WITH_CART_ID_AND_PERSON_ID
};
