import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Address } from "../models/address.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addAddress=asyncHandler(async(req,res)=>{
    const isLoggedUser=req.user;
    if(!isLoggedUser){
        throw new ApiError(401,"Unauthorized user!please login")
    }
    const userId=isLoggedUser._id;
    if(!userId&&!mongoose.isValidObjectId(userId)){
        throw  new ApiError(402,"Invalid user id!")
    }
  const {
        fullName,
        phone,
        anotherPhone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country = "India",
        addressType = "Home",
        isDefault = false
    } = req.body;
    if(!fullName||!phone||!addressLine1||!city||!state||!pincode){
        throw new ApiError(400,"All required fields must me provided!")
    }
    const existingAddressCount=await Address.countDocuments({userId})
    const shouldBeDefault=existingAddressCount===0||isDefault;

   const newAddress= await Address.create({
        userId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        anotherPhone: anotherPhone?.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country.trim(),
        addressType,
        isDefault: shouldBeDefault
    })
   if(!newAddress){
    throw new ApiError(404,"Address creation failed!")
   }
   res.status(200).json(new ApiResponse(200,newAddress,"New address successfully added"))
})
export {addAddress}