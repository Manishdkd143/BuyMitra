import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const create=asyncHandler(async(req,res)=>{
  const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="customer"){
    throw new ApiError(403,"Access-denied customer not allowed!")
  }
  const {name,description,displayName}=req.body;
   if(!name&&name.length){
    throw new ApiError(400,"category name is required!")
   }
  const newCat= await Category.create({
    name:name.toLowerCase().trim(),
    description,displayName,
   })
   if(!newCat&&newCat.length){
  throw new ApiError(404,"category not found!")
   }
   return res.status(200).json(new ApiResponse(200,newCat,"Category created successfully"))
});
const deleteCategory=asyncHandler(async(req,res)=>{
 const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="customer"){
    throw new ApiError(403,"Access-denied customer not allowed!")
  }
})
const getAllCategories=asyncHandler(async(req,res)=>{
 const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="customer"){
    throw new ApiError(403,"Access-denied customer not allowed!")
  }
  const allCat=await Category.find({}).select("-_id");
  if(!allCat&&allCat.length){
    throw new ApiError(404,"category not found!")
  }
  return res.status(200).json(new ApiResponse(200,{total:allCat.length,category:allCat},"All category fetched successfully"))
})
const getCategoryById=asyncHandler(async(req,res)=>{
 const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="customer"){
    throw new ApiError(403,"Access-denied customer not allowed!")
  }
  const {categoryId}=req.params;
  if(!categoryId){
    throw new ApiError(400,"category id required!")
  }
  if(!mongoose.isValidObjectId(categoryId)){
   throw new ApiError(400,"enter valid object id!")
  }
 const category= await Category.findById(categoryId).select("-slug ")
 if(!category&&category.length){
throw new ApiError(404,"Category not found!")
 }
 return res.status(200).json(new ApiResponse(200,category,"category fetched successfully"))
})
const updateCategoryDetails=asyncHandler(async(req,res)=>{
    const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="customer"){
    throw new ApiError(403,"Access-denied customer not allowed!")
  }
   const {categoryId}=req.params;
  if(!categoryId){
    throw new ApiError(400,"category id required!")
  }
  const {name,displayName,description}=req.body;
  const updateField={};
   if(name&&name!==undefined)updateField.name=name.toLowerCase().trim();
   if(displayName&&displayName!==undefined)updateField.displayName=displayName?.trim().toLowerCase();
   if(description&&description!==undefined)updateField.description=description?.trim().toLowerCase();
   const newCat=await Category.findOneAndUpdate({_id:categoryId},{
    $set:updateField
   },
{
    new:true,
    runValidators:true,
})
if(!newCat&&newCat.length){
    throw new ApiError(404,"Category not found!")
}
return res.status(200).json(new ApiResponse(200,newCat,"Category details updated successfully"))
})
const getCategoryStats=asyncHandler(async(req,res)=>{
     const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="customer"){
    throw new ApiError(403,"Access-denied customer not allowed!")
  }
  const countCat=await Category.countDocuments({})
 const categorydetails= await Category.aggregate([
{
  $lookup:{
    from:"products",
    localField:"_id",
    foreignField:"category",
    as:"productDetails",
  }
},
{
  $addFields:{totalProducts:{$size:"$productDetails"},},
},
{
    $sort:{totalProducts:-1}
},
{
  $facet:{
    categories:[
      {
        $project:{
          _id:1,
          name:1,
          totalProducts:1
        }
      }
    ],
    totalCategories:[
      {$count:"totalCategories"},
    ],
    topFiveCatByProduct:[
      {
        $sort:{
          totalProducts:-1,
        },
      },
        {
          $limit:5,
        },
        {
          $project:{
            name:1,
            _id:1,
           totalProducts:1,
          }
        }
    ],
    recentlyAddedProducts:[
      {
        $sort:{
          createdAt:1
        },
      },
      {
        $project:{
          _id:1,
          name:1,
        },
      },
      {
        $limit:5
      }
    ]
  }
},

  ])
  if(!categorydetails&&categorydetails.length){
    throw new ApiError(403,"category not found!")
  }
  const totalProByCat=categorydetails[0]?.categories;
  const totalCategory=categorydetails[0]?.totalCategories[0].totalCategories;
  const topFiveCat=categorydetails[0]?.topFiveCatByProduct;
  const recentCreatedCat=categorydetails[0]?.recentlyAddedProducts;
  return res.status(200).json(new ApiResponse(200,{total:totalCategory,totalProductByCategory:totalProByCat,topFiveCategory:topFiveCat,recentlyAddedCategory:recentCreatedCat},"Category details updated successfully"))
})
const bulkUploadCategory=asyncHandler(async(req,res)=>{

})
const getProductByCategory=asyncHandler(async(req,res)=>{
 const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="customer"){
    throw new ApiError(403,"Access-denied customer not allowed!")
  }
  const {catName}=req.query;
  if(!catName&&catName!==undefined){
    throw new ApiError(400,"category name is required!")
  }
  const category=await Category.findOne({name:catName?.trim().toLowerCase()});
  if(!category&&category?.length){
    throw new ApiError(404,"Category not found!")
  }
  return res.status(200).json(new ApiResponse(200,category,"Category details updated successfully"))
})
export {create,
    deleteCategory,
    bulkUploadCategory,
    getAllCategories,
    getProductByCategory,
    getCategoryStats,
    updateCategoryDetails,
    getCategoryById,
}