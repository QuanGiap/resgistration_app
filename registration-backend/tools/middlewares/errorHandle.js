const errorHandle = (err, req, res, next) => {
    const err_status = err.status_code || 500;
    const err_msg = err.message || 'Something went wrong';
    res.status(err_status).json({
        isError: true,
        status: err_status,
        message: err_msg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
}
module.exports = errorHandle;