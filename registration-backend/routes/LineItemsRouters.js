const lineItemRouter = require('express').Router();
const {verifyToken,sendRes} = require('../tools/verifyToken');
const {queryPromise,QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,QUERY_GET_A_CART_BY_CART_ID,QUERY_CREATE_NEW_LINE_ITEM_BY_PRODUCT_ID_AND_CART_ID_AND_QUANITY,QUERY_GET_LINE_ITEMS_BY_CART_ID_WITH_AMOUNT,QUERY_UPDATE_LINE_ITEMS_QUANITY_BY_LINE_ITEM_ID,QUERY_UPDATE_LINE_ITEMS_TOTAL_PRICE_BY_LINE_ITEM_ID,QUERY_GET_PRODUCTS_BY_PRODUCT_ID} = require('../tools/mySQLQuery');

lineItemRouter.post('/create_new_line_item',verifyToken,async(req,res,next)=>{
    try{
        // const person_id = req.dataToken.personId;
        const cart_id = req.body.cartId;
        const product_id = req.body.productId;
        const quanity = req.body.quanity;
        if(!cart_id) throw ({message:"Missing cartId",statusCode:400});
        if(!product_id) throw({message:"Missing productId",statusCode:400});
        if(!quanity) throw({message:"Missing quanity",statusCode:400});
        // const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID,[cart_id]);
        // if(cart_info.length == 0 || cart_info[0].person_id != person_id) throw ({message:"Create line_item error",statusCode:200});
        await queryPromise(QUERY_CREATE_NEW_LINE_ITEM_BY_PRODUCT_ID_AND_CART_ID_AND_QUANITY,[cart_id,product_id,quanity]);
        return sendRes("Create line items success",res,200,true,null,{create_line_item_success: true});
    }catch(e){
        return sendRes( e.message || "Server error",
        res,
        e.statusCode || 500,
        e.success || false,
        null,
        { create_line_item_success: false });
    }
})
lineItemRouter.get("/get_line_items_by_cart_id/:cart_id",verifyToken,async(req,res,next)=>{
    try{
        // const person_id = req.dataToken.personId;
        const cart_id = req.params.cart_id;
        const amount = req.query.amount || 5;
        const page = req.query.page || 0;
        const skip = amount * page;
        // const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID,[cart_id]);
        // if(cart_info.length == 0 || cart_info[0].person_id != person_id) throw ({message:"get line_items error",statusCode:200});
        const result = await queryPromise(QUERY_GET_LINE_ITEMS_BY_CART_ID_WITH_AMOUNT,[cart_id,amount,skip]);
        return sendRes("Get line items success",res,200,true,null,{get_lines_items_success: true,data:result});
    }catch(e){
        return sendRes( e.message || "Server error",
        res,
        e.statusCode || 500,
        e.success || false,
        null,
        { get_lines_items_success: false });
    }
})
lineItemRouter.patch('/update_line_item_quanity',verifyToken,async (req,res,next)=>{
    try{
        // const person_id = req.dataToken.personId;
        const line_item_id = req.body.lineItemId;
        const quanity = req.body.quanity;
        if(!line_item_id) throw({message:"Missing line_item_id",statusCode:400});
        if(!quanity) throw ({message:"Missing quanity",statusCode:400});
        // const line_item_info = await queryPromise(QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,[line_item_id]);
        // if(line_item_info.length==0) throw({message:"Line item not found",statusCode:200});
        // const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID,[line_item_info[0].cart_id]);
        // if(cart_info.length==0) throw ({message:"cart not found",statusCode:200});
        // if(cart_info[0].person_id!=person_id) throw ({message:"update error",statusCode:200});
        await queryPromise(QUERY_UPDATE_LINE_ITEMS_QUANITY_BY_LINE_ITEM_ID,[quanity,line_item_id]);
        return sendRes("Update line item quanity success",res,200,true,null,{update_line_item_quanity_success: true});
    }catch(e){
        return sendRes( e.message || "Server error",
        res,
        e.statusCode || 500,
        e.success || false,
        null,
        { update_line_item_quanity_success: false });
    }
});
lineItemRouter.patch('/update_line_item_total_price',verifyToken,async(req,res,next)=>{
    try{
        // const person_id = req.dataToken.personId;
        const line_item_id = req.body.lineItemId;
        if(!line_item_id) throw({message:"Missing line_item_id",statusCode:400});
        const line_item_info = await queryPromise(QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,[line_item_id]);
        if(line_item_info.length==0) throw({message:"Line item not found",statusCode:200});
        // const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID,[line_item_info[0].cart_id]);
        // if(cart_info.length==0) throw ({message:"cart not found",statusCode:200});
        // if(cart_info[0].person_id!=person_id) throw ({message:"update error",statusCode:200});
        const product_info = await queryPromise(QUERY_GET_PRODUCTS_BY_PRODUCT_ID,[line_item_id[0].product_id]);
        if(line_item_info.length==0) throw({message:"Product item not found",statusCode:200});
        const total_price = product_info[0].product_price * line_item_info[0].quanity;
        await queryPromise(QUERY_UPDATE_LINE_ITEMS_TOTAL_PRICE_BY_LINE_ITEM_ID,[total_price,line_item_id]);
        return sendRes( "Update price success",res,200,true,null,{ update_line_item_price_success: true });
    }catch(e){
        return sendRes( e.message || "Server error",
        res,
        e.statusCode || 500,
        e.success || false,
        null,
        { update_line_item_price_success: false });
    }
})
module.exports = lineItemRouter;