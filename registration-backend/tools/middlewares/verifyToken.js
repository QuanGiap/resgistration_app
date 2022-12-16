const jwt = require("jsonwebtoken");
const jwkToPem = require('jwk-to-pem');
require('dotenv').config();
const jwk_access = JSON.parse(process.env.JWK_ACCESS);
const pem_access = jwkToPem(jwk_access);
const errorHandle = require('./errorHandle');
function getToken(req){
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  return token;
}
function sendRes(
    message,
    res,
    statusCode = 400,
    isError = false,
    token = null,
    data = null
  ) {
    res.status(statusCode).json({
      status: statusCode,
      message,
      isError,
      data: data || {},
      token: token || undefined,
    });
  }
function verifyToken(req, res, next) {
    const token = getToken(req);
    if (!token) return errorHandle({status_code:401,message:"no token included"},null,res);
    jwt.verify(token, pem_access, { algorithms: ['RS256']}, (err, data) => {
      if (err) return errorHandle({status_code:401,message:"token invalid"},null,res);
      req.dataToken = data.sub;
      req.origin_token = token;
      next();
    });
  }
  module.exports = {verifyToken,sendRes,getToken};