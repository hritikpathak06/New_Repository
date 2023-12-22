const ErrorHandler = require("../utils/errorHandler")

module.exports = (err,req,res,next) => {
   err.stattusCode = err.stattusCode || 500;
   err.message = err.message || "Internal server error";

//    Wrong mongodb id error
if(err.name === "CastError"){
    const message = `Resource not found. Inavalid: ${err.path}`;
    err = new ErrorHandler(message, 400)
}

   res.status(err.stattusCode).json({
    success:false,
    message:err.message,
   })
}