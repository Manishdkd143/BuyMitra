import mongoose from "mongoose";
import { Inventory } from "../models/inventory.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";

/* ================= ADD / INCREASE INVENTORY ================= */
const addInventory = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized user");

  if (user.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Only distributor can add inventory");
  }

  const { productId, qty } = req.body;

  if (!productId || qty === undefined) {
    throw new ApiError(400, "ProductId and quantity are required");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  let inventory = await Inventory.findOne({
    distributorId: user._id,
    productId,
  });

  if (inventory) {
    inventory.quantity += Number(qty);
    await inventory.save();
  } else {
    inventory = await Inventory.create({
      distributorId: user._id,
      productId,
      quantity: Number(qty),
    });
  }

  res.status(200).json(
    new ApiResponse(200, inventory, "Inventory updated successfully")
  );
});

/* ================= UPDATE INVENTORY (MANUAL) ================= */
const updateInventory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { quantity } = req.body;

  if (!user) throw new ApiError(401, "Unauthorized user");

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid inventory ID");
  }

  const inventory = await Inventory.findById(id);
  if (!inventory) throw new ApiError(404, "Inventory not found");

  if (
    user.role.toLowerCase() === "distributor" &&
    inventory.distributorId.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Permission denied");
  }

  if (quantity !== undefined) {
    inventory.quantity = Number(quantity);
  }

  await inventory.save();

  res.status(200).json(
    new ApiResponse(200, inventory, "Inventory updated successfully")
  );
});

/* ================= REDUCE STOCK (ORDER TIME) ================= */
/**
 * ❗ INTERNAL HELPER
 * ❗ API nahi hai
 */
const reduceStock = async (distributorId, productId, qty) => {
  const inventory = await Inventory.findOne({ distributorId, productId });

  if (!inventory) throw new Error("Inventory not found");
  if (inventory.quantity < qty) throw new Error("Insufficient stock");

  inventory.quantity -= qty;
  await inventory.save();

  return inventory;
};

/* ================= GET INVENTORY LIST ================= */
const getInventory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10, search = "" } = req.query;

  if (!user) throw new ApiError(401, "Unauthorized user");

  if (!["admin", "distributor"].includes(user.role.toLowerCase())) {
    throw new ApiError(403, "Access denied");
  }

  const filter = {};

  if (user.role.toLowerCase() === "distributor") {
    filter.distributorId = user._id;
  }

  if (search.trim()) {
    const products = await Product.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");

    filter.productId = { $in: products.map((p) => p._id) };
  }

  const total = await Inventory.countDocuments(filter);
  const skip = (page - 1) * limit;

  const inventory = await Inventory.find(filter)
    .populate("productId", "name price unit category")
    .populate("distributorId", "name email phone")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json(
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

/* ================= GET INVENTORY BY ID ================= */
const getInventoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid inventory ID");
  }

  const inventory = await Inventory.findById(id)
    .populate("productId", "name price unit category")
    .populate("distributorId", "name email phone");

  if (!inventory) throw new ApiError(404, "Inventory not found");

  res.status(200).json(
    new ApiResponse(200, inventory, "Inventory fetched successfully")
  );
});

/* ================= DELETE INVENTORY ================= */
const deleteInventory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid inventory ID");
  }

  const deleted = await Inventory.findOneAndDelete({
    _id: id,
    distributorId: user._id,
  });

  if (!deleted) throw new ApiError(404, "Inventory not found");

  res.status(200).json(
    new ApiResponse(200, deleted, "Inventory deleted successfully")
  );
});
const lowStockProducts = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized user");
  if (user.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Only distributor can access low stock products");
  }
  const lowStockThreshold = 10; 
  const lowStockInventories = await Inventory.find({
    distributorId: user._id,
    quantity: { $lt: lowStockThreshold },
  }).populate("productId", "name price unit category");
  res.status(200).json(
    new ApiResponse(
      200,
      lowStockInventories,
      "Low stock products fetched successfully"
    )
  );
});







export {
  addInventory,
  updateInventory,
  getInventory,
  getInventoryById,
  deleteInventory,
  reduceStock,
  lowStockProducts,
};
