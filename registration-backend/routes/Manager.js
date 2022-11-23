const manageRouter = require('express').Router();

manageRouter.get('/get_line_items',(req,res,next)=>{
    res.redirect('get_line_items');
})