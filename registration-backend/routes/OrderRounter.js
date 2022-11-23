const orderRouter = require('express').Router();
const {verifyToken,sendRes} = require('../tools/verifyToken');
const {queryPromise,QUERY_INSERT_NEW_ORDER_WITH_CART_ID_AND_PERSON_ID,QUERY_GET_ORDER_BY_ORDER_ID,QUERY_GET_ORDER_BY_CART_ID,QUERY_GET_ORDERS_BY_PERSON_ID} = require('../tools/mySQLQuery');
const { query } = require('../tools/mySQLConnetion');

orderRouter.post('/insert_new_order_by_cart_id',verifyToken,async(req,res,next)=>{
    try{
    const cart_id = req.body.cart_id;
    const person_id = req.dataToken.personId;
    if(!cart_id) throw ({message:"Missing cartId in body post",statusCode:400});
    await queryPromise(QUERY_INSERT_NEW_ORDER_WITH_CART_ID_AND_PERSON_ID,[cart_id,person_id]);
    sendRes("Insert order success",res,200);
    }
    catch(e){
        return sendRes(
            e.message || "Server error",
            res,
            e.statusCode || 500,
            e.success||false,
            null,
            { gotProduct: false }
          );
    }
})

orderRouter.get('/get_order_by_cart_id/:cart_id',verifyToken,async(req,res,next)=>{
    const cart_id = req.params.cart_id;
    getOrderByType(res,QUERY_GET_ORDER_BY_CART_ID,[cart_id]);
})

orderRouter.get('/get_order_by_order_id/:order_id',verifyToken,async(req,res,next)=>{
    const order_id = req.params.order_id;
    getOrderByType(res,QUERY_GET_ORDER_BY_ORDER_ID,[order_id]);
})

orderRouter.get('/get_orders_by_person_id',verifyToken,async(req,res,next)=>{
    const person_id = req.dataToken.personId;
    const amount = parseInt(req.query.amount || 5);
    const skip = amount * parseInt(req.query.page || 0);
    getOrderByType(res,QUERY_GET_ORDERS_BY_PERSON_ID,[person_id,amount,skip]);
})

const getOrderByType= async (res,queryType,arrInput) =>{
    try{
        const result = await queryPromise(queryType,arrInput);
        sendRes("Get order success",res,200,true,null,{ got_order_success: true ,data:result});
    }
    catch(e){
        return sendRes(
            e.message || "Server error",
            res,
            e.statusCode || 500,
            e.success||false,
            null,
            { got_order_success: false }
            );
    }
}

module.exports = orderRouter;