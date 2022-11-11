const cartRouter = require("express").Router();
const { verifyToken, sendRes } = require("../tools/verifyToken");
const {
  QUERY_CREATE_NEW_CART_BY_USER_ID,
  QUERY_GET_A_CART_BY_CART_ID,
  QUERY_DELETE_CART_BY_CART_ID,
  QUERY_GET_ALL_TOP_CARTS_WITH_AMOUNT_BY_USER_ID,
  QUERY_UPDATE_CONFIRME_ORDER_BY_CART_ID,
  queryPromise,
} = require("../tools/mySQLQuery");

//create a new cart for user
cartRouter.post("/create_new_carts", verifyToken, async (req, res, next) => {
  try {
    const personId = req.dataToken.personId;
    const result = await queryPromise(QUERY_CREATE_NEW_CART_BY_USER_ID, [
      personId,
    ]);
    return sendRes("create cart success", res, 200, true, null, {
      create_cart_success: true,
    });
  } catch (err) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success || false,
      null,
      { create_cart_success: false }
    );
  }
});

//get cart
cartRouter.get("/get_top_carts", verifyToken, async (req, res, next) => {
  try {
    const personId = req.dataToken.personId || 0;
    const amount = parseInt(req.query.amount || 5);
    const skip = amount * parseInt(req.query.page || 0);
    const result = await queryPromise(
      QUERY_GET_ALL_TOP_CARTS_WITH_AMOUNT_BY_USER_ID,
      [personId, amount, skip]
    );
    sendRes("Get carts success", res, 200, true, null, {
      get_carts_success: true,
      data: result,
    });
  } catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success || false,
      null,
      { get_carts_success: false }
    );
  }
});
cartRouter.get("/get_cart_by_cart_id/:cart_id", verifyToken, async (req, res, next) => {
  try {
    // const personId = (req.dataToken.personId || 0);
    const cart_id = parseInt(req.params.cart_id || -1);
    if (cart_id == -1)
      throw { message: "No cart id included", statusCode: 400 };
    const result = await queryPromise(QUERY_GET_A_CART_BY_CART_ID, [cart_id]);
    if (result.length == 0)
      throw { message: "no cart founds", statusCode: 200, success: true };
    // if(result[0].person_id != personId) throw({message:"can't get cart from other user",statusCode: 200,success: true});
    return sendRes("get cart success", res, 200, true, null, {
      get_cart_success: true,
      data: result,
    });
  } catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success || false,
      null,
      { get_cart_success: false }
    );
  }
});
cartRouter.patch("/confirmed_ordered", verifyToken, async (req, res, next) => {
  try {
    const cart_id = req.body.cartId;

    if (!cart_id)
      throw { message: "Missing cartId in patch body", statusCode: 400 };

    const result = await queryPromise(QUERY_UPDATE_CONFIRME_ORDER_BY_CART_ID, [1, cart_id]);
    return sendRes("Confirmed success", res, 200, true, null, {
      confirmed_success: true,
    });
  } catch (e) {
    return sendRes(
      e.message || "Server error",
      res,
      e.statusCode || 500,
      e.success || false,
      null,
      { confirmed_success: false }
    );
  }
});
cartRouter.patch("/unconfirmed_ordered", verifyToken, async (req, res, next) => {
    try {
      const cart_id = req.body.cartId;
  
      if (!cart_id)
        throw { message: "Missing cartId in patch body", statusCode: 400 };
  
      const result = await queryPromise(QUERY_UPDATE_CONFIRME_ORDER_BY_CART_ID, [0, cart_id]);
      return sendRes("Unconfirmed success", res, 200, true, null, {
        unconfirmed_success: true,
      });
    } catch (e) {
      return sendRes(
        e.message || "Server error",
        res,
        e.statusCode || 500,
        e.success || false,
        null,
        { unconfirmed_success: false }
      );
    }
  });
cartRouter.delete(
  "/delete_cart_by_cart_id",
  verifyToken,
  async (req, res, next) => {
    try {
      // const personId = (req.dataToken.personId || 0);
      const cart_id = parseInt(req.body.cartId || -1);
      if (cart_id == -1)
        throw { message: "No cart id included", statusCode: 400 };
      // const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID,[cart_id]);
      // if(cart_info.length == 0) throw({message:"no cart founds",statusCode: 200,success: true});
      // if(cart_info[0].person_id != personId) throw({message:"can't delete cart from other user",statusCode: 200,success: true});
      const result = await queryPromise(QUERY_DELETE_CART_BY_CART_ID, [
        cart_id,
      ]);
      sendRes("delete cart success", res, 200, true, null, {
        delete_cart_success: true,
      });
    } catch (e) {
      return sendRes(
        e.message || "Server error",
        res,
        e.statusCode || 500,
        e.success || false,
        null,
        { delete_cart_success: false }
      );
    }
  }
);
module.exports = cartRouter;
