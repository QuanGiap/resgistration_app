require('dotenv').config();

const UserRouter = require('./routes/UserRouter')
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/UserRouter');
const mongoString = process.env.DATABASE_URL;
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoString,{ useNewUrlParser: true, useUnifiedTopology: true });
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();

app.use(express.json());

app.use("/user",userRouter);

app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})