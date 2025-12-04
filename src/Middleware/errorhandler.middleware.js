

export const errorHandler = (api) => {
    return (req,res,next)=>{
        api(req,res,next).catch(
            (error) => {
                console.log(`error in ${req.url} from error handler middleware`,error);
                return next(new Error(error.message,{cause:error.cause}))
            } 
        )
    }
}

export const globalErrorHandler = (error,req,res,next) =>{
    console.log(`Global error handler: ${error.message}`);
    return res.status(error.cause || 500).json({message:error.message});    
}