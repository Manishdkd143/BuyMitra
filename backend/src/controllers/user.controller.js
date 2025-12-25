import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import uploadFileOnCloud from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import deleteFileOnCloud from "../utils/deleteFileOnCloud.js";
import SHA256 from "crypto-js/sha256.js";
import crypto from "crypto"
import fs from "fs"
import { DistributorProfile } from "../models/distributorProfile.model.js";
import { sendEmail } from "../utils/mail.js";
import { log } from "console";

const generatedAccessAndRefreshToken=async(userId)=>{
  try {
     const user=await User.findById(userId);
     const refreshToken=await user.generateRefreshToken();
     const accessToken=await user.generateAccessToken();
     user.refreshToken=refreshToken;
     await user.save({validateBeforeSave:false})
     return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(401,"Something went wrong while generating refresh and access tokens!")
  }
}
const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password, phone, gender, role, distributorId,city,pincode } = req.body;

  // Validate
  if ([name, email, password, phone, gender, role,city,pincode].some(field=>!field)) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    throw new ApiError(401, "All fields are required!");
  }

  // Check existing user
  const exists = await User.findOne({ email: email.trim().toLowerCase() });
  if (exists) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    throw new ApiError(409, "User already registered!");
  }

  // Upload profile picture
  let uploadedPic = null;
  if (req.file?.path) {
    uploadedPic = await uploadFileOnCloud(req.file.path);
    if (!uploadedPic) throw new ApiError(500, "File upload failed!");
  }

  // Create User
  const newUser = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: phone.trim(),
    gender: gender.toLowerCase(),
    profilePic: uploadedPic?.url || null,
    role,
    address:{city:city.trim().toLowerCase(),pincode:Number(pincode)||null},
    distributorId: role === "customer" ? distributorId : null,
    isVerified: role === "distributor" ? false : true, // Distributors must be verified
  });

  // If distributor, create empty DistributorProfile
  if (role === "distributor") {
    await DistributorProfile.create({
      userId: newUser._id,
      businessName: "",
      gstNumber: "",
      businessAddress: {},
      documents: [],
      status: "pending",
    });
  }

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully!"));
});

const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(401, "Email and password required!");

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) throw new ApiError(404, "User not found!");

    // Admin cannot use this route
    

    const isValidPassword = await user.isPasswordCorrect(password);
    if (!isValidPassword) throw new ApiError(402, "Invalid credentials!");

    const { accessToken, refreshToken } = await generatedAccessAndRefreshToken(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    // If customer, return distributorId
    const extraData = user.role === "customer" ? { distributorId: user.distributorId } : {};

    const options = { httpOnly: true, secure: true };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedUser, accessToken, ...extraData }, "Logged in successfully"));
});

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
// const forgotPassword=asyncHandler(async(req,res)=>{
//   const {email}=req.body;
//   if(email){
//     throw new ApiError(400,"Email is required!")
//   }
//   const user=await User.findOne({email}).select("-password");
//   if(!user){
//     res.status(200).json(new ApiResponse(200,{},"If this email is registered, a reset link has been sent."))
//   }
//   const token=crypto.randomBytes(32).toString("hex");
//   console.log("Token:",token);
//   if(!token){
//     throw new ApiError(500,"Something error")
//   }
//   const hashedToken=SHA256(token);
//   if(!hashedToken){
//     throw new ApiError(500,"Something system error")
//   }
//   user.resetPasswordToken=hashedToken;
//   user.resetPasswordExpire=new Date.now()*60*1000;
//   await user.save({validateBeforeSave:false})
//   return res.status(200).json(new ApiResponse(200,user,"If this email is registered,a reset link has been sent."))
// })
 const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // const token = crypto.randomBytes(32).toString("hex");
  const token =crypto.randomBytes(32).toString("hex")
  const hashedToken = SHA256(token).toString();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/auth/resetpassword/${token}`;

  const message = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password. Link is valid for 10 minutes.</p>
    <a href="${resetURL}">${resetURL}</a>
  `;

  await sendEmail(user.email, "Password Reset Request", message);

  res.status(200).json({ status: "success", message: "Reset link sent to email" });
});
// const resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params; // correct destructuring
//   const { newPassword, confirmPassword } = req.body;

//   if (!token) {
//     throw new ApiError(404, "Reset link is not generated!");
//   }
//   if (!newPassword || !confirmPassword) {
//     throw new ApiError(404, "Password fields are required!");
//   }
//   if (newPassword.length < 6 || confirmPassword.length < 6) {
//     throw new ApiError(400, "Password length must be at least 6 characters!");
//   }

//   const hashedPass = SHA256(token); // make sure you store hashed token in DB
//   const user = await User.findOne({
//     resetPasswordToken: hashedPass,
//     resetPasswordExpire: { $gt: Date.now() },
//   });

//   if (!user) {
//     throw new ApiError(400, "Reset link is invalid or has expired. Please request a new one.");
//   }

//   user.password = newPassword; // if pre-save hook hashes password, this is fine
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;
//   user.lastPasswordChangeAt = Date.now(); // fix

//   await user.save({ validateBeforeSave: true });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Password updated successfully"));
// });
const resetPassword = asyncHandler(async (req, res) => {
 const { token } = req.params;
const { newPassword, confirmPassword } = req.body;

  if (!token) throw new ApiError(400, "Reset token is required");
  if (!newPassword || !confirmPassword) throw new ApiError(400, "Password fields are required");
  if (newPassword !== confirmPassword) throw new ApiError(400, "Passwords do not match");

  const hashedToken = SHA256(token).toString();

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Reset link is invalid or expired");

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.lastPasswordChangeAt = Date.now();

  await user.save({ validateBeforeSave: true });

  res.status(200).json({ status: "success", message: "Password updated successfully" });
});
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
const getAllApprovedDistributors = asyncHandler(async (req, res) => {
    const { search = "" } = req.query; // search query from frontend

    // Build filter
    const filter = {
        status: "approved",
        $or: [
            { businessName: { $regex: search, $options: "i" } },
            { "businessAddress.city": { $regex: search, $options: "i" } },
            { "businessAddress.state": { $regex: search, $options: "i" } }
        ]
    };

    const distributors = await DistributorProfile.find(filter)
        .select("businessName userId")
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, distributors, "Approved distributors fetched successfully"));
});

export {userRegister,userLogin,userLogout,getAllApprovedDistributors,getCurrentUser,updatePassword,updateProfilePic,updateUserdetails,refreshAccessToken,removeAccount,deleteProfilePic,forgotPassword,resetPassword,applyForDistributor,generatedAccessAndRefreshToken}