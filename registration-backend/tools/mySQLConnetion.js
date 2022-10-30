const mysql = require('mysql');
require('dotenv').config();
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.SQL_PASSWORD
});
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });  
module.exports = db;