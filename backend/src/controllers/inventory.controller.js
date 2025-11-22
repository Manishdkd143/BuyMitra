import mongoose from "mongoose";
import { Inventory } from "../models/inventory.model";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Product } from "../models/product.model";

const addInventory=asyncHandler(async(req,res)=>{
    const isLoggedUser=req.user;
    if(!isLoggedUser){
        throw new ApiError(401,"Unauthorized user!please login")
    }
    const {productId,qty}=req.body;
    if(isLoggedUser.role.toLowerCase!=="distributor"){
        throw new ApiError(403,"Access-denied only distributor allowed!")
    }
    if(!productId||!qty){
        throw new ApiError(400,"product and quantity required!")
    }
    if(!mongoose.isValidObjectId(productId)){
        throw new ApiError(400,"Invalid product id!")
    }
   let  existing=await Inventory.findOne({distributorId:isLoggedUser._id,
        productId:productId
    })
    if(existing){
        existing.quantity+=Number(qty);
        await existing.save()
  return res.status(200).json(new ApiResponse(200,existing,"Inventory updated successfully"))
    }
       const  newInventory=await Inventory.create({
              distributorId:isLoggedUser._id,
              productId:productId,
              quantity:Number(qty),
          })
    
  return res.status(200).json(new ApiResponse(200,newInventory,"Inventory created  successfully"))
})
const updateInventory=asyncHandler(async(req,res)=>{
      const user = req.user;
  const { productId, quantity } = req.body;

  if (user.role !== "distributor") {
    throw new ApiError(403, "Only distributor can update inventory");
  }

  let inventory = await Inventory.findOne({
    productId,
    distributorId: user._id,
  });

  if (!inventory) {
    throw new ApiError(404, "Inventory not found");
  }

  inventory.quantity = Number(quantity);
  await inventory.save();
  return res.status(200).json(new ApiResponse(200,inventory,"Inventory updated"))
})
const reduceStock=asyncHandler(async(distributorId,productId,qty)=>{
    const inventory = await Inventory.findOne({
    distributorId,
    productId,
  });

  if (!inventory) throw new Error("Inventory not found");

  if (inventory.quantity < qty) throw new Error("Insufficient stock");

  inventory.quantity -= qty;
  await inventory.save();

  return inventory;
})
const getInventory=asyncHandler(async(req,res)=>{
  const user=req.user;
  const {page=1,limit=10,search=""}=req.body
  if(!user){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(!["admin","distributor"].includes(user.role.toLowerCase())){
    throw new ApiError(403,"Access-denied retailer not allowed!")
  }
   const filter={}
   if(user.role.toLowerCase()==="distributor"){
    filter.distributorId=user._id
   }
   let productIds=[]
   if(search){
    const products=await Product.find({
        name:{$regex:search,$options:"i"}
    }).select("_id")
  productIds= products.map(p=>p._id);
  filter.productId={$in:productIds}
   }
  const total= await Inventory.countDocuments(filter);
  if(!total){
    return res.status(200).json(new ApiResponse(200,{total:0,Inventory:[]},"Inventory empty!"))
  }
    const inventory = await Inventory.find(filter)
    .populate("productId", "name price unit category")
    .populate("distributorId", "name email phone")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    return res.status(200).json(new ApiResponse(200,{  total,
    page: Number(page),
    limit: Number(limit),
    inventory},"Inventory fetched successfully"))
})
const deleteInventory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { productId } = req.params;

  if (user.role !== "distributor") {
    throw new ApiError(403, "Only distributor can delete inventory");
  }

  const deleted = await Inventory.findOneAndDelete({
    distributorId: user._id,
    productId,
  });

  if (!deleted) {
    throw new ApiError(404, "Inventory not found");
  }

  res.status(200).json(new ApiResponse(200,deleted,"Inventory deleted succecsfully"))
});
export {addInventory,updateInventory,deleteInventory,}