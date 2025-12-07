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
          city: city.trim().toLowerCase().replace(/\s+/g, ""),
    state: state.trim().toLowerCase().replace(/\s+/g, ""),
    pincode: pincode.trim(),
    country: country.trim().toLowerCase().replace(/\s+/g, ""),
        addressType,
        isDefault: shouldBeDefault
    })
   if(!newAddress){
    throw new ApiError(404,"Address creation failed!")
   }
   if(shouldBeDefault){
    await Address.updateMany({userId,_id:{$ne:newAddress._id}},{isDefault:false})
   }
   res.status(200).json(new ApiResponse(200,newAddress,"New address successfully added"))
})
const updateAddress=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const {addressId}=req.params

    if(!userId){
        throw new ApiError(401,"Unauthorized user!please login")
    }
    if(!addressId||!mongoose.isValidObjectId(addressId)){
        throw new ApiError(401,"Invalid addressId or required!")
    }
    const address=await Address.findOne({_id:addressId,userId});
    if(!address){
        throw new ApiError(404,"Address not found!")
    }
    const {isDefault}=req.body;
    if(isDefault===true){
        await Address.updateMany({userId,_id:{$ne:addressId}},{isDefault:false})
        address.isDefault=true;
    }
    Object.assign(address,req.body)
    await address.save();
     res.status(200).json(new ApiResponse(200, address, "Address updated successfully"));
})
const getAllAddresses = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const addresses = await Address.find({ userId }).sort({ isDefault: -1 });

    res.status(200).json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});
const deleteAddress = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { addressId } = req.params;

    const deleted = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!deleted) throw new ApiError(404, "Address not found!");

    // When deleting default address → make another available address default
    const remaining = await Address.findOne({ userId });
    if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
    }

    res.status(200).json(new ApiResponse(200, deleted, "Address deleted successfully"));
});
const setDefaultAddress=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const {addressId}=req.params;
    if(!addressId||!mongoose.isValidObjectId(addressId)){
        throw new ApiError(400,"Address id required!")
    }
    await Address.updateMany({ userId }, { isDefault: false });
    const defaultAddress=await Address.findByIdAndUpdate(addressId,{isDefault:true},{new:true});
    return res.status(200).json(new ApiResponse(200,defaultAddress,"Address default successfully"))
})
export {addAddress,updateAddress,deleteAddress,getAllAddresses,setDefaultAddress}