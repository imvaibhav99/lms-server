//after writing the error middleware,we can avoid writiing the try catch in 
//the controllers

export class ApiError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode= statusCode;
        this.status= `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational= true; //to distinguish between operational errors and programming errors
        
        Error.captureStackTrace(this, this.constructor);
    }
}



export const catchAsyncErrors = (fn) => {
    return (req,res, next)=>{
        fn(req, res, next).catch(next); //if any error occurs in the async function, it will be passed to the next middleware (error handler)
    }
}


//handlig jwt error

export const handleJWTError= ()=>{
    new ApiError('Invalid token. Please Login again', 401)
}