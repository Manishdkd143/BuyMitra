import { Category } from "../models/category.model.js";
import { ApiError } from "./ApiError.js";

const ensureCategoryExists=async(categoryName)=>{
    if(!categoryName) throw new ApiError(400,"category is required!");
    const normalizeCategory=categoryName?.trim().toLowerCase();
    let category=await Category.findOne({name:normalizeCategory})
    if(!category){
        category=await Category.create({name:normalizeCategory})
    }
     return category;
}
export {ensureCategoryExists}