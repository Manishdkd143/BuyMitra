import mongoose from "mongoose";
import { Inventory } from "../models/inventory.model";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Product } from "../models/product.model";

const addorUpdateInventory=asyncHandler(async(req,res)=>{
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
   const  existing=await Inventory.findOne({distributorId:isLoggedUser._id,productId
    })
    let result;
    if(existing){
        existing.quantity+=Number(qty);
        await existing.save()
        result=existing
  return res.status(200).json(new ApiResponse(200,existing,"Inventory updated successfully"))
    }else{
      const  result=await Inventory.create({
             distributorId:isLoggedUser._id,
             productId,
             quantity:Number(qty),
         })
    }
    
  return res.status(200).json(new ApiResponse(200,result,"Inventory created  successfully"))
})
const updateInventory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { quantity } = req.body;

  if (!user) throw new ApiError(401, "Unauthorized user!");
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid inventory ID");
  }

  const inventory = await Inventory.findById(id);
  if (!inventory) throw new ApiError(404, "Inventory not found");

  // Distributor can update only his inventory
  if (user.role.toLowerCase() === "distributor" &&
      inventory.distributorId.toString() !== user._id.toString()) {
    throw new ApiError(403, "Permission denied");
  }

  inventory.quantity = Number(quantity) ?? inventory.quantity;
  await inventory.save();

  res.status(200).json(new ApiResponse(200, inventory, "Inventory updated successfully"));
});
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
const getInventory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10, search = "" } = req.query;

  if (!user) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  const userRole = user.role?.toLowerCase();
  if (!["admin", "distributor"].includes(userRole)) {
    throw new ApiError(403, "Access denied — retailer not allowed");
  }

  // Base filter
  const filter = {};

  // Distributor can only see his own inventory
  if (userRole === "distributor") {
    filter.distributorId = user._id;
  }

  // Search products by name
  if (search.trim() !== "") {
    const products = await Product.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");

    const productIds = products.map((p) => p._id);

    if (productIds.length > 0) {
      filter.productId = { $in: productIds };
    }
  }

  // Count total
  const total = await Inventory.countDocuments(filter);

  if (total === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { total: 0, inventory: [] }, "Inventory empty!"));
  }

  const skip = (page - 1) * limit;

  const inventory = await Inventory.find(filter)
    .populate("productId", "name price unit category")
    .populate("distributorId", "name email phone")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: Number(page),
        limit: Number(limit),
        inventory,
      },
      "Inventory fetched successfully"
    )
  );
});

const deleteInventory = asyncHandler(async (req, res) => {
    const distributorId = req.user?._id;
    const { id } = req.params;

    const deleted = await Inventory.findOneAndDelete({ _id: id, distributorId });
    if (!deleted) throw new ApiError(404, "Inventory item not found!");

    res.status(200).json(
        new ApiResponse(200, deleted, "Inventory item deleted successfully")
    );
});
const getInventoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid inventory ID");
  }

  const inventory = await Inventory.findById(id)
    .populate("productId", "name price unit category")
    .populate("distributorId", "name email phone");

  if (!inventory) throw new ApiError(404, "Inventory not found");

  res.status(200).json(new ApiResponse(200, inventory, "Inventory details fetched"));
});

export {addorUpdateInventory,updateInventory,deleteInventory,getInventory,getInventoryById}