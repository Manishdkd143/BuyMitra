import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const isAdmin=asyncHandler(async(req,res,next)=>{
    try {
        const user=req?.user;
        if(!user){
            throw new ApiError(401,"Unauthorized user!")
        }
        if(user.role!=="admin"){
            throw new ApiError(403,"Access denied-Admin only!")
        }
        next()
    } catch (error) {
        return  new ApiError(500,next(error))
    }
})
const isAdminOrDistributor=asyncHandler(async(req,res,next)=>{
    const user=req?.user;
        if(!user){
            throw new ApiError(401,"Unauthorized user!")
        }
         if(user.role?.trim()?.toLowerCase()!=="admin"&&user.role?.trim()?.toLowerCase()!=="distributor"){
            throw new ApiError(403,"Access-denied Admin and distributor only!")
        }
        next()
})
export {isAdmin,isAdminOrDistributor}