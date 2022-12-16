const lineItemRouter = require('express').Router();
const {verifyToken,sendRes} = require('../tools/middlewares/verifyToken');
const {queryPromise,QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID,QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,QUERY_GET_A_CART_BY_CART_ID,QUERY_GET_LINE_ITEM_BY_CART_ID_AND_PRODUCT_ID,QUERY_CREATE_NEW_LINE_ITEM_BY_PRODUCT_ID_AND_CART_ID_AND_QUANITY,QUERY_GET_LINE_ITEMS_BY_CART_ID_WITH_AMOUNT,QUERY_UPDATE_LINE_ITEMS_QUANITY_BY_LINE_ITEM_ID,QUERY_UPDATE_LINE_ITEMS_TOTAL_PRICE_BY_LINE_ITEM_ID,QUERY_GET_PRODUCT_BY_PRODUCT_ID} = require('../tools/mySQLQuery');

lineItemRouter.use(verifyToken);
lineItemRouter.use(checkEnoughInform);
lineItemRouter.post('/add_new_line_item',async(req,res,next)=>{
    try{
        const cart_id = req.body.CartId;
        const product_id = req.body.ProductId;
        const quanity = req.body.Quanity;
        let errorLine = "";
        if(!cart_id)  errorLine = errorLine + "Missing cart_id ";
        if(!product_id)  errorLine = errorLine + "Missing product_id ";
        if(!quanity) errorLine = errorLine + "Missing quanity";
        if(errorLine.length!=0) throw({message:errorLine,status_code:400});
        //check if user already add this product in the cart
        const line_item_check = queryPromise(QUERY_GET_LINE_ITEM_BY_CART_ID_AND_PRODUCT_ID,[cart_id,product_id]);
        if(line_item_check.length!=0) throw({message:"you already add this item in the cart, if you want to change amount of item, please go to /update_line_item_quanity",status_code:400})
        await queryPromise(QUERY_CREATE_NEW_LINE_ITEM_BY_PRODUCT_ID_AND_CART_ID_AND_QUANITY,[cart_id,product_id,quanity]);
        return sendRes("Create line items success",res,200,true,null,{create_line_item_success: true});
    }catch(e){
        next(e);
    }
})

lineItemRouter.get("/get_line_items",async(req,res,next)=>{
    try{

        const line_item_id = req.query.LineItemId;
        if(line_item_id)
        {
            const result = await queryPromise(QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,[line_item_id]);
            return sendRes("Found line items",res,200,true,null,{get_lines_items_success: true, data:result})
        }

        const cart_id = req.query.CartId;
        const product_id = req.query.ProductId;
        if(product_id) { 
            const result = await queryPromise(QUERY_GET_LINE_ITEM_BY_CART_ID_AND_PRODUCT_ID,[cart_id,product_id]);
            return sendRes("Get line items success",res,200,true,null,{get_lines_items_success: true,data:result});
        }

        const amount = parseInt(req.query.Amount) || 5;
        const page = parseInt(req.query.Page) || 0;
        const skip = amount * page;
        const result = await queryPromise(QUERY_GET_LINE_ITEMS_BY_CART_ID_WITH_AMOUNT,[cart_id,amount,skip]);
        return sendRes("Get line items success",res,200,true,null,{get_lines_items_success: true,data:result});
    }catch(e){
        next(e);
    }
})

lineItemRouter.patch('/update_line_item_quanity',async (req,res,next)=>{
    try{
        const line_item_id = req.body.LineItemId;
        const quanity = req.body.Quanity;
        if(!line_item_id) throw({message:"Missing lineItemId",status_code:400});
        if(!quanity) throw ({message:"Missing quanity",status_code:400});
        await queryPromise(QUERY_UPDATE_LINE_ITEMS_QUANITY_BY_LINE_ITEM_ID,[quanity,line_item_id]);
        return sendRes("Update line item quanity success",res,200,true,null,{update_line_item_quanity_success: true});
    }catch(e){
        next(e);
    }
});
// lineItemRouter.patch('/confirmed_order',async(req,res,next)=>{
//     try{
//         // const person_id = req.dataToken.personId;
//         const line_item_id = req.body.line_item_id;
//         if(!line_item_id) throw({message:"Missing line_item_id",status_code:400});

//         const line_item_info = await queryPromise(QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,[line_item_id]);
//         const product_info = await queryPromise(QUERY_GET_PRODUCT_BY_PRODUCT_ID,[line_item_info[0].product_id]);
//         if(product_info.length==0) throw({message:"Product item not found",status_code:200});
//         if(product_info[0].product_quanity < line_item_info[0].quanity) throw({message:"Amount of buying bigger than amount of selling",status_code:400});
//         const total_price = parseInt((product_info[0].product_price*(100-product_info[0].product_discount)/100) * line_item_info[0].quanity);
//         await queryPromise(QUERY_UPDATE_PRODUCT_BY_PRODUCT_ID,[null,null,null,null,product_info[0].product_quanity-line_item_info[0].quanity]);
//         await queryPromise(QUERY_UPDATE_LINE_ITEMS_TOTAL_PRICE_BY_LINE_ITEM_ID,[total_price,line_item_id]);
//         return sendRes("Update price success",res,200,true,null,{ update_line_item_price_success: true });
//     }catch(e){
//        next(e);
//     }
// })
async function checkEnoughInform(req,res,next){
    const person_id = req.dataToken.personId;
    const cart_id = req.body.CartId || req.params.CartId || req.query.CartId;
    const line_item_id = req.body.LineItemId || req.params.LineItemId || req.query.LineItemId || -1;
    let line_item_info = [];
    //if no cart id from req, get from line item id
    if(!cart_id){
        line_item_info = await queryPromise(QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,[line_item_id]);
        if(line_item_info.length==0) return sendRes("Missing or invalid information",res,400,false);
    }
    //checking if it the owner
     const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID,[cart_id||line_item_info?.[0].cart_id||-1]);
     if(cart_info.length == 0 || cart_info[0].person_id != person_id) return sendRes("Missing or invalid information",res,400,false);
     next();
}
module.exports = lineItemRouter;