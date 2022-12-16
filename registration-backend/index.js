require('dotenv').config();

const express = require('express');

const db = require('./tools/mySQLConnetion');
const userRouter = require('./routes/UserRouter_new');
const authRouter = require('./routes/AuthRouter');
const cartRouter = require('./routes/CartRouter');
const lineItemRouter = require('./routes/LineItemsRouters');
const orderRouter = require('./routes/OrderRounter');
const productRouter = require('./routes/ProductRouter');
const PORT = process.env.PORT || 6000;
const cors = require('cors');
const errorHandle = require('./tools/middlewares/errorHandle');
const app = express();

app.use(cors());

app.use(express.json());
app.use("/user",userRouter);
app.use('/cart',cartRouter);
app.use('/line_item',lineItemRouter);
app.use('/order',orderRouter);
app.use('/product',productRouter);
app.use('/auth',authRouter);


app.use(errorHandle);
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})