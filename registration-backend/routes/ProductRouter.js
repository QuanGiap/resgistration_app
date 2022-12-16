const productRouter = require("express").Router();
const {queryPromise,QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID,QUERY_INSERT_NEW_PRODUCT_WITH_PERSONID_NAME_DESCRIBE_PRICE_DISCOUNT_QUANITY,QUERY_GET_PRODUCT_BY_PRODUCT_ID} = require('../tools/mySQLQuery');
const {verifyToken,sendRes} = require("../tools/middlewares/verifyToken");

productRouter.post("/insert_new_product",verifyToken,async(req,res,next)=>{
    try{
    const product_describe = req.body.ProductDescribe;
    const product_discount = parseInt(req.body.ProductDiscount);
    const product_name = req.body.ProductName;
    const product_price = parseInt(req.body.ProductPrice);
    const product_quantity = parseInt(req.body.ProductQuanity);
    const person_id = req.dataToken.personId;
    if(!product_describe) throw ({message:"Missing product_describe in the body post",status_code:400}); 
    if(!product_discount) throw ({message:"Missing product_discount in the body post",status_code:400}); 
    if(!product_name) throw ({message:"Missing product_name in the body post",status_code:400}); 
    if(!product_price) throw ({message:"Missing product_price in the body post",status_code:400}); 
    if(!product_quantity) throw ({message:"Missing product_quanity in the body post",status_code:400});
    if(100-product_discount<0) throw ({message:"Discount only from 0 to 100",status_code:400});
    await queryPromise(QUERY_INSERT_NEW_PRODUCT_WITH_PERSONID_NAME_DESCRIBE_PRICE_DISCOUNT_QUANITY,[person_id,product_name,product_describe,product_price,product_discount,product_quantity]);
    return sendRes("Product inserted success",res,200,false,null,{ insertSuccess: true });
    }catch(e){
        next(e);
    }
})

productRouter.get('/get_product/:ProductId',async (req,res,next)=>{
    try{
    const product_id = req.params.ProductId;
    const result = await queryPromise(QUERY_GET_PRODUCT_BY_PRODUCT_ID,[product_id]);
    return sendRes("Got result of the product",res,200,false,null,{ gotProduct: true,data:result });
    }catch(e){
        next(e);
    }
})

productRouter.patch("/update_product",verifyToken,async(req,res,next)=>{
    try{
        const product_describe = req.body.ProductDescribe;
        const product_discount = req.body.ProductDiscount;
        const product_name = req.body.ProductName;
        const product_price = req.body.ProductPrice;
        const product_quantity = req.body.ProductQuanity;
        const product_id = req.body.ProductId;
        if(!product_id) throw({message:"Missing product_id in body patch",status_code:400});
        await queryPromise(QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID,[product_name,product_describe,product_price,product_discount,product_quantity,product_id]);
        return sendRes("Update product success",res,200,false,null,{ updateSuccess: true });
    }catch(e){
        next(e);
    }
})

module.exports = productRouter;