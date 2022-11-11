const productRouter = require("express").Router();
const {queryPromise,QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID,QUERY_INSERT_NEW_PRODUCT_WITH_PERSONID_NAME_DESCRIBE_PRICE_DISCOUNT_QUANITY,QUERY_GET_PRODUCTS_BY_PRODUCT_ID} = require('../tools/mySQLQuery');
const {verifyToken,sendRes} = require("../tools/verifyToken");

productRouter.post("/insert_new_product",verifyToken,async(req,res,next)=>{
    try{
    const product_describe = req.body.productDescribe;
    const product_discount = req.body.productDiscount;
    const product_name = req.body.productName;
    const product_price = req.body.productPrice;
    const product_quantity = req.body.productQuanity;
    const person_id = req.dataToken.personId;
    if(!product_describe) throw ({message:"Missing productDescribe in the body post",statusCode:400}); 
    if(!product_discount) throw ({message:"Missing productDiscount in the body post",statusCode:400}); 
    if(!product_name) throw ({message:"Missing productName in the body post",statusCode:400}); 
    if(!product_price) throw ({message:"Missing productPrice in the body post",statusCode:400}); 
    if(!product_quantity) throw ({message:"Missing productQuanity in the body post",statusCode:400});
    await queryPromise(QUERY_INSERT_NEW_PRODUCT_WITH_PERSONID_NAME_DESCRIBE_PRICE_DISCOUNT_QUANITY,[person_id,product_name,product_describe,product_price,product_discount,product_quantity]);
    return sendRes("Product inserted success",res,200,true,null,{ insertSuccess: true });
    }catch(e){
        return sendRes(
            e.message || "Server error",
            res,
            e.statusCode || 500,
            e.success||false,
            null,
            { insertSuccess: false }
          );
    }
})

productRouter.get('/get_product/:product_id',async (req,res,next)=>{
    try{
    const product_id = req.params.product_id;
    const result = await queryPromise(QUERY_GET_PRODUCTS_BY_PRODUCT_ID,[product_id]);
    return sendRes("Got result of the product",res,200,true,null,{ gotProduct: true,data:result });
    }catch(e){
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

productRouter.patch("/update_product_by_product_id",verifyToken,async(req,res,next)=>{
    try{
        const product_describe = req.body.productDescribe;
        const product_discount = req.body.productDiscount;
        const product_name = req.body.productName;
        const product_price = req.body.productPrice;
        const product_quantity = req.body.productQuanity;
        const product_id = req.body.productId;
        if(!product_id) throw({message:"Missing productId in body patch",statusCode:400});
        await queryPromise(QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID,[product_name,product_describe,product_price,product_discount,product_quantity,product_id]);
        return sendRes("Update product success",res,200,true,null,{ updateSuccess: true });
    }catch(e){
        return sendRes(
            e.message || "Server error",
            res,
            e.statusCode || 500,
            e.success||false,
            null,
            { updateSuccess: false }
            );
    }
})

module.exports = productRouter;