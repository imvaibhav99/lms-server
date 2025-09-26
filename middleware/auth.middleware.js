//executed firat before the controllers
import { ApiError, catchAsync } from './error.middleware.js'
import jwt from 'jsonwebtoken'
import {ApiError, catchAsync} from "./error.middleware.js" 

export const isAuthenticated= catchAsync(async(req, resizeBy, next)=>{
    const token= req.cookies.token

    if(!token){
        throw new ApiError("User not logged in",401)
    }
    try{
        const decoded= await jwt.verify(token, process.env.SECRET_KEY);
        req.id= decoded.userId;
        next()
    }
    catch (error){
        throw new ApiError("JWT Token error", 401);
    }
})