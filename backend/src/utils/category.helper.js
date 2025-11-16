import { Category } from "../models/category.model.js";
import { ApiError } from "./ApiError.js";
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
};
const ensureCategoryExists=async(categoryName)=>{
    if(!categoryName||typeof categoryName!=="string"){
     throw new ApiError(400,"Valid category name is required!")
    }
    const normalizedName=categoryName.trim().toLowerCase()
   if(!normalizedName){
       throw new ApiError(400, "Category name cannot be empty!");
   }
  const category= await Category.findOneAndUpdate({name:normalizedName},{
     $setOnInsert:{name:normalizedName,slug:generateSlug(normalizedName)},
   },
{
     new:true,
     upsert:true,
     runValidators:true,
}).select("_id")
return category._id;
}
export {ensureCategoryExists}