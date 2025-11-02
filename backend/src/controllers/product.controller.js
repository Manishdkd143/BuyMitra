import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import fs from "fs"
const createProduct=asyncHandler(async(req,res)=>{
 const {isLoggedUser}=req?.user
 if(isLoggedUser.role==="retailer"){
    fs.unlinkSync(req.file?.path);
    throw new ApiError(400,"retailer not allowed!")
 }
 const {title,description,price,wholesalePrice,discount,sku,stock,category,createdBy}=req.body;
 if([title,description,price,wholesalePrice,sku,discount,stock,category,createdBy].some((field)=>!field)){
    throw new ApiError(400,"All field required!")
 }
   let productImages;
  
}) 