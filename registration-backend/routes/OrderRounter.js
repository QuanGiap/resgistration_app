const orderRouter = require('express').Router();
const {verifyToken,sendRes} = require('../tools/middlewares/verifyToken');
const {queryPromise,QUERY_INSERT_NEW_ORDER_WITH_CART_ID_AND_PERSON_ID,QUERY_GET_ORDER_BY_ORDER_ID,QUERY_GET_ORDER_BY_CART_ID,QUERY_GET_ORDERS_BY_PERSON_ID} = require('../tools/mySQLQuery');
const { query } = require('../tools/mySQLConnetion');

orderRouter.post('/insert_new_order_by_cart_id',verifyToken,async(req,res,next)=>{
    try{
    const cart_id = req.body.CartId;
    const person_id = req.dataToken.personId;
    if(!cart_id) throw ({message:"Missing cartId in body post",status_code:400});
    await queryPromise(QUERY_INSERT_NEW_ORDER_WITH_CART_ID_AND_PERSON_ID,[cart_id,person_id]);
    sendRes("Insert order success",res,200);
    }
    catch(e){
        next(e);
    }
})

orderRouter.get('/get_order',verifyToken,async(req,res,next)=>{
    const cart_id = req.query.CartId;
    if(cart_id) return getOrderByType(res,QUERY_GET_ORDER_BY_CART_ID,[cart_id]);
    const order_id = req.query.OrderId;
    if(order_id) return getOrderByType(res,QUERY_GET_ORDER_BY_ORDER_ID,[order_id]);

    const person_id = req.dataToken.personId;
    const amount = parseInt(req.query.Amount || 5);
    const skip = amount * parseInt(req.query.Page || 0);
    getOrderByType(res,QUERY_GET_ORDERS_BY_PERSON_ID,[person_id,amount,skip]);
})

const getOrderByType= async (res,queryType,arrInput) =>{
    try{
        const result = await queryPromise(queryType,arrInput);
        sendRes("Get order success",res,200,false,null,{ got_order_success: true ,data:result});
    }
    catch(e){
        next(e);
    }
}

module.exports = orderRouter;