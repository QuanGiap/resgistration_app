const {queryPromise,QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,QUERY_GET_A_CART_BY_CART_ID} = require('../tools/mySQLQuery');
const {sendRes} = require('./verifyToken');

async function checkOwnerCart(req,res,next){
    const person_id = req.dataToken.personId;
    const cart_id = req.body.cart_id || req.params.cart_id;
    const line_item_id = req.body.line_item_id || req.params.line_item_id;
    let line_item_info = null;
    //if no cart id from req, get from line item id
    if(!cart_id) line_item_info = await queryPromise(QUERY_GET_A_LINE_ITEM_BY_LINE_ITEM_ID,[line_item_id]);
    if(!cart_id && line_item_info && line_item_info.length==0) return sendRes("Invalid get or modified data from other user",res,200,true);
     //checking if it the owner
     const cart_info = await queryPromise(QUERY_GET_A_CART_BY_CART_ID,[cart_id||line_item_info?.[0].cart_id]);
     if(cart_info.length == 0 || cart_info[0].person_id != person_id) return sendRes("Invalid get or modified data from other user",res,200,true);
     next();
}

module.exports = checkOwnerCart;