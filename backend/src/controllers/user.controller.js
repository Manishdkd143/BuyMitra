import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import uploadFileOnCloud from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import deleteFileOnCloud from "../utils/deleteFileOnCloud.js";
import SHA256 from "crypto-js/sha256.js";
import fs from "fs"
import { DistributorProfile } from "../models/distributorProfile.model.js";

const generatedAccessAndRefreshToken=async(userId)=>{
  try {
     const user=await User.findById(userId);
     const refreshToken=await user.generateRefreshToken();
     const accessToken=await user.generateAccessToken();
     user.refreshToken=refreshToken;
     await user.save({validateBeforeSave:false})
     return {refreshToken,accessToken}
  } catch (error) {
    throw new ApiError(401,"Something went wrong while generating refresh and access tokens!")
  }
}


const userRegister=asyncHandler(async(req,res)=>{
    //todo-->
    /*
    name email password take body
    check validation 
    hashed password 
    take profile pic local path
    check localPath and upload cloudinary
    again check picpath
    save db 

    
    */
//    console.log(req.body);
   
   const {name,email,password,phone,role="retailer",gender}=req.body;
  if([name,email,password,phone,gender,role].some((field)=>!field)){
    fs.unlinkSync(req.file?.path)
    throw new ApiError(401,"All fields required!")
  }
  const exists=await User.findOne({email:email.toLowerCase()})
  if(exists){
     if(req.file?.path){
        fs.unlinkSync(req.file?.path)
      }
    throw new ApiError(409,"User already registered!")
  }
 if(role?.trim().toLowerCase()==="admin"){
 const existingAdmin= await User.findOne({role:"admin"});
     if (existingAdmin) {
      if(req.file?.path){
        fs.unlinkSync(req.file?.path)
      }
        throw new ApiError(403, "Admin already exists! Only one admin is allowed.");
    }

 }
  let uploadedPic=null;
   if(req.file?.path){
    const picLocalPath=req.file?.path
    uploadedPic=await uploadFileOnCloud(picLocalPath);
    if(!uploadedPic){
          throw new ApiError(500, "File upload failed! Please try again.");
    }
   }
   
    const newUser = await User.create({
    name: name.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password,
    phone: phone.trim(),
    role: role ? role.trim().toLowerCase() : "retailer",
    profilePic: uploadedPic?.url||null,
    gender: gender.trim().toLowerCase(),
  });
    if(!newUser){
        throw new ApiError(402,"User not created!")
    }
    const createdUser=await User.findById(newUser._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(404,"User registration failed!")
    }
    return res.status(201).json(new ApiResponse(201,createdUser,"User created successfully"))
})
const userLogin=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    if(!email){
        throw new ApiError(401,"Email is required!")
    }
     if(!password){
        throw new ApiError(401,"Password is required!")
    }
    const user=await User.findOne({email:email?.trim().toLowerCase()});
    if(!user){
        throw new ApiError(404,"User not exists!please register")
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(402,"Invalid user credentials!")
    }
    const {refreshToken,accessToken}=await generatedAccessAndRefreshToken(user._id);
     if(!refreshToken||!accessToken){
    throw new ApiError(401,"Tokens is empty!");
   }
   const isLoggedUser=await User.findById(user._id).select("-password -refreshToken")

   const options={
    httpOnly:true,
    secure:true,
   }
   return res.status(200)
   .cookie('refreshToken',refreshToken,options)
   .cookie('accessToken',accessToken,options)
   .json(new ApiResponse(200,{user:isLoggedUser,accessToken,distributorId:isLoggedUser.role.toLowerCase()==="distributor"?isLoggedUser._id:null},"User Logged successfully!"))
})
const userLogout=asyncHandler(async(req,res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError(400,"Unauthorized user!please login")
    }
   await User.findByIdAndUpdate(user._id,{
        $set:{
            refreshToken:undefined,
        }
    },
{
    new:true
})
const options={
    httpOnly:true,
    secure:true,
}
return res.status(200).clearCookie("refreshToken",options).clearCookie("accessToken",options).json(new ApiResponse(200,{},"User logout successfully!"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    const user=req.user;
     if(!user){
        throw new ApiError(400,"Unauthorized user!please login")
    }
    const currentUser=await User.findById(user._id).select("-password -refreshToken -address._id")
    return res.status(200).json(new ApiResponse(200,currentUser,"User fetched successfully!"))
})
const updatePassword=asyncHandler(async(req,res)=>{
     const currUser=req.user;
     if(!currUser){
        throw new ApiError(400,"Unauthorized user!please login")
    }
    const {oldPass,newPass,confirmPass}=req.body;
    if(!oldPass||!newPass||!confirmPass){
        throw new ApiError(400,"All fields are required!")
    }
    if(newPass!==confirmPass){
        throw new ApiError(401,"Password not matched!")
    }
    const user=await User.findById(currUser._id);
    if(!user){
     throw new ApiError(404,"Unauthorized user!")
    }
    const validPass=await user.isPasswordCorrect(oldPass);
    if(!validPass){
        throw new ApiError(401,"old password is incorrect!")
    }
    user.password=newPass;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"Password  updated successfully"))

})
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies?.refreshToken||req.body?.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(404,"Unauthorized user!")
    }
   const decodedRefreshToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    if(!decodedToken){
        throw new ApiError(401,"Invalid token!")
    }
   const user= await User.findById(decodedRefreshToken?._id).select("-password -refreshToken");
   if(!user){
    throw new ApiError(404,"User not exists")
   }
    if(incomingRefreshToken!==user.refreshToken){
        throw new ApiError(401,"token is expiry or used!")
    }
    const {newRefreshToken,accessToken}=await generatedAccessAndRefreshToken(user._id);
    if(!newRefreshToken||!accessToken){
        throw new ApiError(401,"tokens not generated!")
    }
    const options={
        httpOnly:true,
        secure:true,
    }
  return res.status(200).cookie("refreshToken",newRefreshToken,options).cookie("accessToken",accessToken,options).json(new ApiResponse(200,{user,refreshToken:newRefreshToken,accessToken},"Access token refreshed successfully"))
})
const updateProfilePic=asyncHandler(async(req,res)=>{
    const currUser=req.user;
    if(!currUser){
        throw new ApiError(401,"Unauthorized user!")
    }
    const profileLocalPath = req.file?.path;
  if (!profileLocalPath) {
    throw new ApiError(400, "Profile picture file is required!");
  }

  const user = await User.findById(currUser._id);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  if(user.profilePic){
    await deleteFileOnCloud(user.profilePic)
  }
   const uploadedProfile = await uploadFileOnCloud(profileLocalPath);
  if (!uploadedProfile) {
    throw new ApiError(500, "File upload failed! Please try again.");
  }
    user.profilePic = uploadedProfile;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { profilePic: uploadedProfile }, "Profile picture updated successfully!"));

})
const updateUserdetails=asyncHandler(async(req,res)=>{
  const {name,email,phone,city,state,pincode,street}=req.body;
  const user=req?.user
  if(!user){
    throw new ApiError(404,"Unauthorized user!")
  }
  const updateFields={}
  if(name&&name.trim()!=="")updateFields.name=name.trim().toLowerCase();
  if(email&&email.trim()!=="") updateFields.email=email.trim().toLowerCase();
  if(phone&&phone.trim()!=="")updateFields.phone=phone.trim().toLowerCase();
  const addressField={};
  if(city&&city.trim()!=="")addressField.city=city.trim().toLowerCase();
  if(pincode&&pincode.trim()!=="") addressField.pincode=pincode.trim().toLowerCase();
  if(state&&state.trim()!=="") addressField.state=state.trim().toLowerCase();
  if(street&&street.trim()!=="") addressField.street=street.trim().toLowerCase();
  if(Object.keys(addressField).length>0){
    updateFields.address=addressField;
  }
  if(Object.keys(updateFields).length<0){
    throw new ApiError(400,"At least one field must be provided to update!")
  }
if(updateFields.email){
  const existingUser=await User.findOne({email:updateFields.email})
   if(existingUser&&existingUser._id.toString()!==user._id.toString()){
    throw new ApiError(409,"Email is already registered in another account try another email!")
  }
}
 const updatedUser=await User.findByIdAndUpdate(user?._id,
{
  $set:updateFields
},
{
  new:true,
}).select("-password -refreshToken -address._id")

if(!updatedUser){
    throw new ApiError(404,"User not exists")
}
return res.status(200).json(new ApiResponse(200,{updatedUser},"User details updated successfully"))

})
const removeAccount=asyncHandler(async(req,res)=>{
    const user=req?.user;
    if(!user){
        throw new ApiError(401,"Unauthorized user!")
    }
    const remove=await User.findByIdAndDelete(user?._id);
    if(!remove){
        throw new ApiError(404,"User not exists!")
    }
    return res.status(200).json(new ApiResponse(200,remove,"User account permanently deleted!"))
})
const deleteProfilePic = asyncHandler(async (req, res) => {
  const user = req?.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized user!");
  }

  const existingUser = await User.findById(user._id);
  if (!existingUser) {
    throw new ApiError(404, "User not found!");
  }

  if (!existingUser.profilePic) {
    throw new ApiError(400, "Profile picture is already empty!");
  }

  const deleteResult = await deleteFileOnCloud(existingUser.profilePic);

  if (!deleteResult?.result || deleteResult.result !== "ok") {
    throw new ApiError(500, "Failed to delete profile picture from cloud!");
  }


  existingUser.profilePic = "";
  await existingUser.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Profile picture deleted successfully"));
});
const forgotPassword=asyncHandler(async(req,res)=>{
  const {email}=req.body;
  if(email){
    throw new ApiError(400,"Email is required!")
  }
  const user=await User.findOne({email}).select("-password");
  if(!user){
    res.status(200).json(new ApiResponse(200,{},"If this email is registered, a reset link has been sent."))
  }
  const token=crypto.randomBytes(32).toString("hex");
  console.log("Token:",token);
  if(!token){
    throw new ApiError(500,"Something error")
  }
  const hashedToken=SHA256(token);
  if(!hashedToken){
    throw new ApiError(500,"Something system error")
  }
  user.resetPasswordToken=hashedToken;
  user.resetPasswordExpire=new Date.now()*60*1000;
  await user.save({validateBeforeSave:false})
  return res.status(200).json(new ApiResponse(200,user,"If this email is registered,a reset link has been sent."))
})
const resetPassword=asyncHandler(async(req,res)=>{
  const {token}=req.params.token;
  const {newPassword,confirmPassword}=req.body;
  if(!token){
    throw new ApiError(404,"reset link is not generated!")
  }
  if(!newPassword||!confirmPassword){
    throw new ApiError(404,"password fields is required!")
  }
  if(newPassword.length<6&&confirmPassword.length<6){
    throw new ApiError(400,"password length is minimum!")
  }
  const hashedPass=SHA256(token)
  const user=await User.findOne({resetPasswordToken:hashedPass,resetPasswordExpire:{$gt:Date.now()}})
  if(!user){
    throw new ApiError(400,"Reset link is invalid or has expired. Please request a new one.")
  }
  user.password=newPassword;
  user.resetPasswordToken=undefined;
  user.resetPasswordExpire=undefined;
  user.lastPasswordChangeAt=new Date.now()
  await user.save({validateBeforeSave:true})
  return res.status(200).json(new ApiResponse(200,{},"Password updated successfully"))
})
const applyForDistributor=asyncHandler(async(req,res)=>{
  const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  const {
    businessName, gstNumber,phone, address, city, state, pincode
  }=req.body;
  if([businessName,phone,address,city,state,pincode].some((field=>!field))){
    throw new ApiError(400,"All field fill required!")
  }
  if(isLoggedUser.role==="admin"){
    throw new ApiError(401,"Admin no required for this role!")
  }
  const existingApplication=await DistributorProfile.findOne({userId:isLoggedUser._id});
    if (existingApplication) {
        if (existingApplication.status === "pending") {
            throw new ApiError(400, "Application already submitted and pending review!");
        }
        if (existingApplication.status === "approved") {
            throw new ApiError(400, "You are already a distributor!");
        }
    }
    const documents=[];
     if (req.files?.gstCertificate?.[0]) {
        const gstDoc = await uploadFileOnCloud(req.files.gstCertificate[0].path);
        if (gstDoc) {
            documents.push({ docType: "gst_certificate", url: gstDoc.url });
        }
    }
    
    if (req.files?.businessProof?.[0]) {
        const businessDoc = await uploadFileOnCloud(req.files.businessProof[0].path);
        if (businessDoc) {
            documents.push({ docType: "business_proof", url: businessDoc.url });
        }
    }
    let addressFields={};
    if(city&&city!==undefined) addressFields.city=city?.trim().toLowerCase();
    if(state&&state!==undefined) addressFields.state=state?.trim().toLowerCase();
    if(!isNaN(pincode))addressFields.pincode=Number(pincode);
    const application=await DistributorProfile.create({
      userId:isLoggedUser._id,
      businessName:businessName?.trim().toLowerCase(),
      gstNumber:gstNumber||null,
      businessPhone:Number(phone),
      businessAddress:addressFields,
      documents: documents.length > 0 ? documents : undefined,

    })
    if(!application){
      throw new ApiError(404,"Application submition failed!")
    }
       return res.status(201).json(
        new ApiResponse(201, application, "Application submitted successfully! Admin will review soon.")
    );
})


export {userRegister,userLogin,userLogout,getCurrentUser,updatePassword,updateProfilePic,updateUserdetails,refreshAccessToken,removeAccount,deleteProfilePic,forgotPassword,resetPassword,applyForDistributor}