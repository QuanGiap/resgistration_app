require('dotenv').config();

// const UserRouter = require('./routes/UserRouter')
const express = require('express');
// const mongoose = require('mongoose');
// const mongoString = process.env.DATABASE_URL;
// mongoose.connect(mongoString,{ useNewUrlParser: true, useUnifiedTopology: true });
// const database = mongoose.connection;
// database.on('error', (error) => {
//     console.log(error)
// })

// database.once('connected', () => {
//     console.log('Database Connected');
// })
const db = require('./tools/mySQLConnetion');
const userRouter = require('./routes/UserRouter');
const cartRouter = require('./routes/CartRouter');
const lineItemRouter = require('./routes/LineItemsRouters');
const orderRouter = require('./routes/OrderRounter');
const productRouter = require('./routes/ProductRouter');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const app = express();

app.use(cors());

app.use(express.json());
app.use("/user",userRouter);
app.use('/cart',cartRouter);
app.use('/line_item',lineItemRouter);
app.use('/order',orderRouter);
app.use('/product',productRouter);
app.get('/test/getdata',(req,res)=>{
    const query = "SELECT * FROM sql_shop_data.users_info;"
    db.query(query,(err,result)=>{
        if(err) return res.json(err);
        return res.json(result);
    })
})
app.get('/test/updateData',(req,res)=>{
    const query = "UPDATE sql_shop_data.users_info SET first_name = COALESCE(?,first_name) WHERE person_id = ?;";
    db.query(query,['test',1],(err)=>{
        if(err) return res.json(err);
        return res.json({success:true});
    })
})
app.get('/test/insertData',(req,res)=>{
    const query = "INSERT INTO sql_shop_data.users_info (last_name,first_name,country,email,password) VALUES (?, ?, ?, ?,?);";
    db.query(query,['Giap','Giap','WA','testing@gmail.com','password'],(err,result)=>{
        if(err) return res.json(err);
        return res.json(result);
    })
})
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})