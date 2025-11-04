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
export {getAllUser,getUserById,changeUserRole,deleteAnyAccount,approvalUser,getAllApprovedUser,getUnApprovedUser}