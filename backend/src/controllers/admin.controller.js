import { application } from "express";
import { DistributorProfile } from "../models/distributorProfile.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

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
        matchStage.role=role
     }
     if(search){
        matchStage.$or=[
            {
                name:{$regex:search,options:"i"}},
            {
                email:{$regex:search,options:"i"}},
            {
                phone:{$regex:search,options:"i"}}
        ]
     }
 const userAgg=  await User.aggregate([
        {$match:matchStage},
        {
            $project:{
                password:0,
                refreshToken:0,
                __v:0,
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $facet:{
                metadata:[{$count:"totalUsers"}],
                data:[{$skip:skip},{$limit:Number(limit)}]
            }
        }
     ])
    //   const users=await User.find({role:{$ne:"admin"}}).select("-password -refreshToken")
  const users=userAgg[0]?.data||[];
  const totalUsers=userAgg[0]?.metadata[0]?.totalUsers||0;
      return res.status(200).json(new ApiResponse(200,{users,totalUsers,totalPages:Math.ceil(totalUsers/limit),currentPage:Number(page)},"All users fetched successfully"))
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
    if(isLoggedUser?.role.toLowerCase()!=="admin"){
        throw new ApiError(403,"Access denied-Admin only!")
     }
  const foundUser= await User.findById(userId).select("-password -refreshToken")
   if(!foundUser){
        throw new ApiError(404,"User not exists")
    }
    if(foundUser.role.toLowerCase()==="distributor"){
        foundUser.role="retailer";
    }
    else if(foundUser.role.toLowerCase()==="retailer"){
        foundUser.role="distributor"
    }
    else {
    throw new ApiError(400, "Invalid role to change!");
  }
   await foundUser.save()
   return res.status(200).json(new ApiResponse(200,foundUser,"Role updated successfully"))
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
  const deletedUser= await User.findByIdAndDelete(userId).select("-password -refreshToken")
if(!deletedUser){
    throw new ApiError(404,"User not exists!")
}
return res.status(200).json(new ApiResponse(200,deletedUser,"User deleted successfully"))
})
const approvalUser=asyncHandler(async(req,res)=>{
     const {userId}=req.params;
    const isLoggedUser=req?.user
    if(!userId){
        throw new ApiError(400,"User id required!")
    }
    if(isLoggedUser?.role.toLowerCase()!=="admin"){
        throw new ApiError(403,"Access denied-Admin only!")
     }
    const existingUser= await User.findById(userId).select("-password -refreshToken")
    if(existingUser?.role.toLowerCase()==="retailer"){
         throw new ApiError(400, "Retailers do not require admin approval!");
    }
    if(!existingUser){
        throw new ApiError(404,"User not exists!")
    }
    if(existingUser.approvedByAdmin?.isApproval===true){
      throw new ApiError(400,"User already approved")
    }
  const approvedUser= await User.findByIdAndUpdate(existingUser._id,{
        $set:{
            "approvedByAdmin.isApproval":true,
            "approvedByAdmin.approvalBy":isLoggedUser._id,
            "approvedByAdmin.approvalDate":new Date(),
        },
    },    
{
    new:true,
}).select("-password -refreshToken -approvedByAdmin._id")

    return res.status(200).json(new ApiResponse(200,{user:approvedUser},"User approved successfully"))
})
const getAllApprovedUser=asyncHandler(async(req,res)=>{
    const isLoggedUser=req?.user;
    if(isLoggedUser?.role.toLowerCase()!=="admin"){
        throw new ApiError(403,"Access denied-Admin only!")
     }
     const allApprovedUser=await User.find({"approvedByAdmin.isApproval":true}).select("-password -refreshToken -approvedByAdmin._id")
     if(allApprovedUser.length===0){
         throw new ApiError(404,"User not exists!")
     }
     return res.status(200).json(new ApiResponse(200,allApprovedUser,"All approved user fetched!"))
})
const getAllApprovedDistributor=asyncHandler(async(req,res)=>{
    const isLoggedUser=req?.user;
    if(!isLoggedUser){
        throw new ApiError(401,"Unauthorized user!please login")
    }
    if(isLoggedUser.role!=="admin"){
        throw new ApiError(403,"Access-denied only admin allowed!")
    }
   const approvedDist= await DistributorProfile.find({status:"approved"}).populate("userId","name email phone profilePic").sort({createdAt:-1})
   if(!approvedDist){
    throw new ApiError(404,"Approved distributor not found!")
   }
   return res.status(200).json(new ApiResponse(200,approvedDist,"all approved distributor fetched successfully"))

})
const getUnApprovedUser=asyncHandler(async(req,res)=>{
     const isLoggedUser=req?.user;
    if(isLoggedUser?.role.toLowerCase()!=="admin"){
        throw new ApiError(403,"Access denied-Admin only!")
     }
     const unApproved=await User.find({
  $or: [
    { "approvedByAdmin.isApproval": false },
    { "approvedByAdmin.isApproval": { $exists: false } }
  ]
}).select("-password -refreshToken")
       if(unApproved.length===0){
         throw new ApiError(404,"User not exists!")
     }
     return res.status(200).json(new ApiResponse(200,unApproved,"Unapproved users fetched successfully!"))
})

//getPendingApplication,approveDistributor,rejectDistributor
const getPendingApplication=asyncHandler(async(req,res)=>{
   const {status="pending",page=1,limit=10}=req.query;
  const skip=(Number(page)-1)*Number(limit)
   const applications=await DistributorProfile.find({status:status}).populate("userId","name email phone profilePic").skip(skip).limit(limit).sort({createdAt:-1})
   return res.status(200).json(
        new ApiResponse(200, applications, "Applications fetched successfully")
    );
})
const approveDistributor=asyncHandler(async(req,res)=>{
    const {applicationId}=req.params;
    if(!applicationId){
        throw new ApiError(404,"application id required!")
    }
   const application= await DistributorProfile.findById(applicationId)
   if(!application){
    throw new ApiError(404,"Application not found!")
   }
   if(application.status!=="pending"){
    throw new ApiError(403,"Application already reviewed!")
   }
   application.status="approved";
   application.approval.isApproved=true;
   application.approval.approvedBy=req.user._id;
   application.approval.approvedAt= Date.now();
   application.approval.reviewedBy=req?.user._id;
   await application.save()
   await User.findByIdAndUpdate(application.userId,{
    role:"distributor"
   })
   return res.status(200).json(
        new ApiResponse(200, application, "Distributor approved successfully!")
    );
})
const rejectDistributor=asyncHandler(async(req,res)=>{
    const {applicationId}=req.params;
    const {reason}=req.body;
    if(!reason||reason===""){
   throw new ApiError(400,"Reason is empty!")
    }
   const application= await DistributorProfile.findById(applicationId);
   if(!application){
    throw new ApiError(404,"distributor not found!")
   }
   if(application.status!=="pending"){
    throw new ApiError(400,"distributor already reviewed")
   }
   application.status="rejected";
   application.approval.isApproved=false;
   application.approval.rejectionReason=reason||undefined,
   application.approval.rejectedAt=Date.now()
   application.approval.reviewedBy=req?.user._id;
   await application.save();
     return res.status(200).json(
        new ApiResponse(200, application, "Application rejected!")
    );
})
const getAllRejectedDistributor=asyncHandler(async(req,res)=>{
    const {status="rejected"}=req.query;
    const isLoggedUser=req.user;
    if(!isLoggedUser){
        throw new ApiError(401,"Unauthorization user!please login")
    }
    if(isLoggedUser.role!=="admin"){
        throw new ApiError(403,"Access-denied only admin allowed!")
    }
  
    const rejectedDistributor= await DistributorProfile.find({status:status?.trim().toLowerCase()}).populate("userId","name email phone profilePic").sort({createdAt:-1})
    if(!rejectedDistributor){
        throw new ApiError(404,"Rejected distributor not found!")
    }
    return res.status(200).json(new ApiResponse(200,rejectedDistributor,"all rejected distributor fetched successfully!"))
})

export {getAllUser,getUserById,changeUserRole,deleteAnyAccount,approvalUser,getAllApprovedUser,getUnApprovedUser,getPendingApplication,approveDistributor,rejectDistributor,getAllApprovedDistributor,getAllRejectedDistributor}