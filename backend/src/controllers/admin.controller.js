import { application } from "express";
import { DistributorProfile } from "../models/distributorProfile.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadFileOnCloud from "../utils/Cloudinary.js";
import { generatedAccessAndRefreshToken } from "./user.controller.js";
const adminRegister=asyncHandler(async(req,res)=>{
    const {secretKey,name,email,phone,password,gender}=req.body;
    if (!secretKey || secretKey !== process.env.ADMIN_SECRET) {
        throw new ApiError(401, "Unauthorized! Invalid secret key");
    }

    // Validate required fields
    if (!name || !email || !password || !gender) {
        if (req.file?.path) fs.unlinkSync(req.file.path);
        throw new ApiError(400, "All required fields must be provided!");
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
        if (req.file?.path) fs.unlinkSync(req.file.path);
        throw new ApiError(403, "Admin already exists!");
    }

    // Check if email is already used by any user
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
        if (req.file?.path) fs.unlinkSync(req.file.path);
        throw new ApiError(409, "Email already used!");
    }
  let uploadedFile = null;

if (req.file && req.file.path) {
    uploadedFile = await uploadFileOnCloud(req.file.path);
    if (!uploadedFile) {
        throw new ApiError(500, "Image upload failed!");
    }
}
    const admin=await User.create({
      name: name.trim().toLowerCase(),
gender: gender.trim().toLowerCase(),
        email:email.trim().toLowerCase(),
        phone,
        password,
        role:"admin",
        isVerified:true,
        profilePic:uploadedFile?.url||null,
    })
if (!admin) {
    throw new ApiError(500, "Failed to create admin!");
}

    const createdAdmin=await User.findById(admin._id).select("-password -refreshToken")
     return res
    .status(201)
    .json(new ApiResponse(201, createdAdmin, "Admin registered successfully!"));
})
const adminLogin=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        throw new ApiError(400,"Email or Password are required!")
    }
    const admin=await User.findOne({email:email.trim().toLowerCase()});
    if(!admin){
        throw new ApiError(404,"Admin not found!")
    }
    if(admin.role!=="admin"){
        throw new ApiError(403,"Unauthorized!You are not admin!")
    }
    const validPass=await admin.isPasswordCorrect(password);
    if(!validPass){
      throw new ApiError(401,"Invalid admin credentials")
    }
    const {accessToken,refreshToken}=await generatedAccessAndRefreshToken(admin._id);
    if(!accessToken||!refreshToken){
      throw new ApiError(500, "Failed to generate tokens.");
    }
    const isLoggedAdmin=await User.findById(admin._id).select("-password -refreshToken");
    const options={
        httpOnly:true,
        secure:true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: isLoggedAdmin,
                accessToken,
            },
            "Admin logged in successfully!")
        );
})
const getAllUser=asyncHandler(async(req,res)=>{
     const isLoggedUser=req?.user;
  const {page=1,limit=10,search="",role,email}=req.query;
  const skip=(Number(page)-1)*Number(limit);
     if(!isLoggedUser||isLoggedUser?.role!=="admin"){
        throw new ApiError(403,"Access denied-Admin only!")
     }
     const matchStage={
       role:{$ne:"admin"},
     }
     if(role){
        matchStage.role=role.toLowerCase()
     }
     if (email) {
        matchStage.email = email.trim().toLowerCase();
    }
     if(search){
        matchStage.$or=[
            {
                name:{$regex:search,$options:"i"}},
            {
                email:{$regex:search,$options:"i"}},
            {
                phone:{$regex:search,$options:"i"}}
        ]
     }
const userAgg = await User.aggregate([
        { $match: matchStage },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                __v: 0
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: "totalUsers" }],
                data: [
                    { $skip: skip },
                    { $limit: limit }
                ]
            }
        }
    ]);

    //   const users=await User.find({role:{$ne:"admin"}}).select("-password -refreshToken")
     const users = userAgg[0]?.data || [];
    const totalUsers = userAgg[0]?.metadata[0]?.totalUsers || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                totalUsers,
                totalPages,
                currentPage: page
            },
            "Users fetched successfully!"
        )
    );
})
const getUserById=asyncHandler(async(req,res)=>{
     const isLoggedUser=req?.user;
     const {userId}=req.params;
     if(isLoggedUser?.role.toLowerCase()!=="admin"){
        throw new ApiError(403,"Access denied-Admin only!")
     }
     if(!userId){
        throw new ApiError(400,"User id required!")
     }
    const foundUser=await User.findById(userId).select("-password -refreshToken")
    if(!foundUser){
        throw new ApiError(404,"User not exists")
    }
    return res.status(200).json(new ApiResponse(200,foundUser,"User fetched Successfully"))
})
const changeUserRole=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    const isLoggedUser=req?.user;
    if(!userId){
        throw new ApiError(400,"User id required!")
    }
      if (isLoggedUser?.role?.toLowerCase() !== "admin") {
        throw new ApiError(403, "Access denied – Admin only!");
    }
 const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User does not exist!");
    }
     const currentRole = user.role?.toLowerCase();
   
    if (!["customer", "distributor"].includes(currentRole)) {
        throw new ApiError(400, "Only distributor/customer roles can be changed!");
    }
        user.role = currentRole === "distributor" ? "customer" : "distributor";
   await user.save()
   return res.status(200).json(new ApiResponse(200,user,"Role updated successfully"))
})
const deleteAnyAccount=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    const isLoggedUser=req?.user
    if(!userId){
        throw new ApiError(400,"User id required!")
    }
    if(isLoggedUser?.role.toLowerCase()!=="admin"){
        throw new ApiError(403,"Access denied-Admin only!")
     }
      const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User does not exist!");
    }
      if (user.role === "distributor") {
        await DistributorProfile.findOneAndDelete({ userId: user._id });
    }
    await User.findByIdAndDelete(userId);
 
return res.status(200).json(new ApiResponse(200,user,"User deleted successfully"))
})
// const approvalUser=asyncHandler(async(req,res)=>{
//      const {userId}=req.params;
//     const isLoggedUser=req?.user
//     if(!userId){
//         throw new ApiError(400,"User id required!")
//     }
//     if(isLoggedUser?.role.toLowerCase()!=="admin"){
//         throw new ApiError(403,"Access denied-Admin only!")
//      }
//       const existingUser = await User.findById(userId).select("-password -refreshToken");
//     if (!existingUser) {
//         throw new ApiError(404, "User does not exist!");
//     }
//      if (existingUser.role.toLowerCase() === "customer") {
//         throw new ApiError(400, "customers do not require admin approval!");
//     }
//     if (existingUser?.approvedByAdmin?.isApproval === true) {
//         throw new ApiError(400, "User already approved!");
//     }
//    const approvedUser = await User.findByIdAndUpdate(
//         existingUser._id,
//         {
//             $set: {
//                 "approvedByAdmin.isApproval": true,
//                 "approvedByAdmin.approvalBy": isLoggedUser._id,
//                 "approvedByAdmin.approvalDate": new Date(),
//             },
//         },
//         { new: true }
//     ).select("-password -refreshToken -approvedByAdmin._id");
//  if (!approvedUser) {
//         throw new ApiError(500, "Failed to approve user!");
//     }
//    return res.status(200).json(
//         new ApiResponse(
//             200,
//             { user: approvedUser },
//             "User approved successfully!"
//         )
//     );
// })
const getAllApprovedUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Admin only access!");
    }

    const users = await User.find({ status: "active" }).select("-password -refreshToken");

    if (users.length === 0) {
        throw new ApiError(404, "No approved users found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Approved users fetched successfully"));
});



const getUnapprovedUsers = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin only access!");
}


    const users = await User.find({ status: "pending" }).select("-password -refreshToken");

    if (users.length === 0) {
        throw new ApiError(404, "No unapproved users found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Unapproved users fetched successfully"));
});

const getAllApprovedDistributor = asyncHandler(async (req, res) => {
   if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin only access!");
}


    const distributors = await DistributorProfile.find({ status: "approved" })
        .populate("userId", "name email phone profilePic")
        .sort({ createdAt: -1 });

    if (distributors.length === 0) {
        throw new ApiError(404, "No approved distributors found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, distributors, "Approved distributors fetched"));
});

//getPendingApplication,approveDistributor,rejectDistributor
const getPendingApplication = asyncHandler(async (req, res) => {
    const { status = "pending", page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin only access!");
}

    // Fetch applications
    const applications = await DistributorProfile.find({ status })
        .populate("approval.approvedBy", "name email")
.populate("approval.reviewedBy", "name email").sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    // Total applications count
    const total = await DistributorProfile.countDocuments({ status });

    return res.status(200).json(
        new ApiResponse(200, {
            applications,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        }, "Applications fetched successfully")
    );
});

const approveDistributor = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;

    if (!applicationId) {
        throw new ApiError(400, "Application ID is required!");
    }
    if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin only access!");
}

    // Find distributor application
    const application = await DistributorProfile.findById(applicationId).populate("userId");

    if (!application) {
        throw new ApiError(404, "Application not found!");
    }

    // Already reviewed?
    if (application.status !== "pending") {
        throw new ApiError(403, "This application has already been reviewed!");
    }

    // Update application status
    application.status = "approved";
    application.approval.isApproved = true;
    application.approval.approvedBy = req.user._id;
    application.approval.approvedAt = new Date();
    application.approval.reviewedBy = req.user._id;

    await application.save();

    // Update actual User role to "distributor"
    const updatedUser = await User.findByIdAndUpdate(
        application.userId._id,
        { role: "distributor" },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                application,
                updatedUser
            },
            "Distributor approved successfully!"
        )
    );
});

const rejectDistributor = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { reason } = req.body;

    if (!applicationId) {
        throw new ApiError(400, "Application ID is required!");
    }
   if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin only access!");
}

    if (!reason || reason.trim() === "") {
        throw new ApiError(400, "Rejection reason is required!");
    }

    // Fetch application with user details
    const application = await DistributorProfile.findById(applicationId).populate("userId");
    
    if (!application) {
        throw new ApiError(404, "Distributor application not found!");
    }

    // Check if already reviewed
    if (application.status !== "pending") {
        throw new ApiError(400, "This application has already been reviewed.");
    }

    // Update rejection details
    application.status = "rejected";
    application.approval.isApproved = false;
    application.approval.rejectionReason = reason;
    application.approval.rejectedAt = new Date();
    application.approval.reviewedBy = req.user._id;

    await application.save();

    return res.status(200).json(
        new ApiResponse(200, application, "Distributor application rejected successfully!")
    );
});

const getAllRejectedDistributor = asyncHandler(async (req, res) => {
    const isLoggedUser = req.user;

    if (!isLoggedUser) {
        throw new ApiError(401, "Unauthorized user! Please login.");
    }

    if (isLoggedUser.role !== "admin") {
        throw new ApiError(403, "Access denied — Admin only!");
    }

    const rejectedDistributor = await DistributorProfile.find({
        status: "rejected"
    })
    .populate("userId", "name email phone profilePic")
    .sort({ createdAt: -1 });

    if (rejectedDistributor.length === 0) {
        throw new ApiError(404, "No rejected distributor found!");
    }

    return res.status(200).json(
        new ApiResponse(200, rejectedDistributor, "All rejected distributors fetched successfully!")
    );
});

export {adminRegister,adminLogin,getAllUser,getUserById,changeUserRole,deleteAnyAccount,getAllApprovedUsers,getUnapprovedUsers,getPendingApplication,approveDistributor,rejectDistributor,getAllApprovedDistributor,getAllRejectedDistributor}