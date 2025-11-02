import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
const verifyJWT=asyncHandler(async(req,res,next)=>{
try {
    const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(404,"Unauthorized user!please login")
    }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    if(!decodedToken){
        throw new ApiError(402,"Invalid Access Token!")
    }
    const user=await User.findById(decodedToken._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(404,"User not exists!")
    }
    req.user=user;
    next()
} catch (error) {
    throw new ApiError(401,error?.message||"User not verified!")
}

})
export default verifyJWT;