const jwt = require("jsonwebtoken");
function sendRes(
    message,
    res,
    statusCode = 400,
    isSuccess = false,
    token = null,
    data = null
  ) {
    res.status(statusCode).json({
      status: statusCode,
      message,
      success: isSuccess,
      data: data || {},
      token: token,
    });
  }
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return sendRes("No token included", res, 401, false, null);
    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
      if (err) return sendRes("Token invalid", res, 401, false, null);
      req.dataToken = data;
      next();
    });
  }
  function sendResult(e){
    return sendRes( e.message || "Server error",
        e.res,
        e.statusCode || 500,
        e.success || false,
        null,
        e.data);
  }
  // function checkPassKey(req,res,next){}
  module.exports = {verifyToken,sendRes,sendResult};