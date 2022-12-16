const cartRouter = require("express").Router();
const { verifyToken, sendRes } = require("../tools/middlewares/verifyToken");
const axios = require('axios');
const {
  QUERY_CREATE_NEW_CART_BY_USER_ID,
  QUERY_GET_A_CART_BY_CART_ID,
  QUERY_DELETE_CART_BY_CART_ID,
  QUERY_GET_ALL_TOP_CARTS_WITH_AMOUNT_BY_USER_ID,
  QUERY_UPDATE_CONFIRME_ORDER_BY_CART_ID,
  queryPromise,
} = require("../tools/mySQLQuery");

cartRouter.use(verifyToken);
//create a new cart for user
cartRouter.post("/create_new_cart", async (req, res, next) => {
  try {
    const personId = req.dataToken.personId;
    const result = await queryPromise(QUERY_CREATE_NEW_CART_BY_USER_ID, [
      personId,
    ]);
    return sendRes("create cart success", res, 200, false, null, {
      create_cart_success: true,
      new_cart_id:result.insertId,
    });
  } catch (e) {
    next(e);
  }
});

//get cart
cartRouter.get("/get_carts", async (req, res, next) => {
    const person_id = req.dataToken.personId || 0;
    const cart_id = parseInt(req.query.CartId);

    if(cart_id){return getCartById({cart_id,person_id},req,res,next);}
    
    const amount = parseInt(req.query.Amount || 5);
    const skip = amount * parseInt(req.query.Page || 0);
    return getCartsByPersonId({person_id,amount,skip},req,res,next);
});

//set confirm order
// cartRouter.patch("/confirmed_ordered/", async (req, res, next) => {
//   try {
//     const cart_id = req.body.CartId;
//     const config = {
//       params: { cart_id,amount:8000},
//       headers: { Authorization: `Bearer ${req.origin_token}` }
//     };
//     const line_items = await axios.get(process.env.URL_GET_LINE_ITEMS,null,config)
//     //////////////////////////////////////////////////////////////
//     if (!cart_id)
//       throw { message: "Missing cartId in patch body", status_code: 400 };
//     const result = await queryPromise(QUERY_UPDATE_CONFIRME_ORDER_BY_CART_ID, [1, cart_id]);
//     return sendRes("Confirmed success", res, 200, false, null, {
//       set_confirmed_success: true,
//     });
//   } catch (e) {
//     next(e);
//   }
// });

cartRouter.delete(
  "/delete_cart",
  async (req, res, next) => {
    try {
      const cart_id = parseInt(req.body.CartId || -1);
      if (cart_id == -1)
      throw { message: "No cart id included", status_code: 400 };
      
      if(!await checkIsItOwner(req.dataToken.personId,cart_id)) throw ({message: "Not authorize to access this cart",status_code : 401,success : true});
      
      const result = await queryPromise(QUERY_DELETE_CART_BY_CART_ID, [
        cart_id,
      ]);

      sendRes("delete cart success", res, 200, false, null, {
        delete_cart_success: true,
      });
    } catch (e) {
      next(e);
    }
  }
);

const checkIsItOwner = async(person_id,cart_id) =>{
  const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID, [cart_id]);
  return cart_info.length != 0 && cart_info[0].person_id == person_id;
}

const getCartsByPersonId = async({person_id=-1,amount=5,skip=0},req,res,next)=>{
  try {
  const result = await queryPromise(
    QUERY_GET_ALL_TOP_CARTS_WITH_AMOUNT_BY_USER_ID,
    [person_id, amount, skip]
  );
  return sendRes("Get carts success", res, 200, false, null, {
    get_carts_success: true,
    data: result,
  });
  } catch (e) {
    next(e);
  }
}
const getCartById = async ({cart_id,person_id},req, res, next) => {
  try {
    const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID, [cart_id]);
    if(cart_info.length != 0 && cart_info[0].person_id != person_id) throw ({message: "Not authorize to access this cart",status_code : 401,success : true});
    return sendRes("get cart success", res, 200, false, null, {
      get_cart_success: true,
      data: {cart_info},
    });
  } catch (e) {
    next(e);
  }
};
module.exports = cartRouter;
