import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* -------------------- HELPERS -------------------- */

const reduceInventory = async (distributorId, productId, qty) => {
  const inventory = await Inventory.findOne({ distributorId, productId });
  if (!inventory) throw new ApiError(404, "Inventory not found");
  if (inventory.quantity < qty) {
    throw new ApiError(400, "Insufficient stock");
  }
  inventory.quantity -= qty;
  await inventory.save();
};

const restoreInventory = async (distributorId, products) => {
  for (const item of products) {
    await Inventory.findOneAndUpdate(
      { distributorId, productId: item.productId },
      { $inc: { quantity: item.qty } }
    );
  }
};

/* -------------------- CREATE ORDER -------------------- */

const createOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { distributorId, shippingAddress, paymentMethod = "cod", orderNotes } = req.body;

  if (!mongoose.isValidObjectId(distributorId)) {
    throw new ApiError(400, "Invalid distributor ID");
  }

  if (
    !shippingAddress?.name ||
    !shippingAddress?.phone ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.pincode
  ) {
    throw new ApiError(400, "Complete shipping address required");
  }

  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const products = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.productId;

    // 🔴 INVENTORY CHECK & REDUCE
    await reduceInventory(distributorId, product._id, item.qty);

    const itemTotal = item.price * item.qty;
    totalAmount += itemTotal;

    products.push({
      productId: product._id,
      qty: item.qty,
      price: item.price,
      totalPrice: itemTotal,
    });
  }

  const order = await Order.create({
    distributorId,
    userId,
    products,
    totalAmount,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "unpaid" : "unpaid",
    status: "pending",
    orderNotes,
  });

  await Cart.findByIdAndUpdate(cart._id, { items: [] });

  const populatedOrder = await Order.findById(order._id)
    .populate("userId", "name email phone")
    .populate("distributorId", "name businessName")
    .populate("products.productId", "name images sku");

  return res.status(201).json(
    new ApiResponse(201, populatedOrder, "Order placed successfully")
  );
});

/* -------------------- GET ORDER BY ID -------------------- */

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("userId", "name email phone")
    .populate("distributorId", "name businessName")
    .populate("products.productId", "name images sku")
    .populate("paymentInfo");

  if (!order) throw new ApiError(404, "Order not found");

  const isAuthorized =
    order.userId._id.toString() === req.user._id.toString() ||
    order.distributorId._id.toString() === req.user._id.toString() ||
    req.user.role === "admin";

  if (!isAuthorized) throw new ApiError(403, "Not authorized");

  return res.status(200).json(
    new ApiResponse(200, order, "Order fetched successfully")
  );
});

/* -------------------- MY ORDERS (RETAILER) -------------------- */

const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const orders = await Order.find({ userId: req.user._id })
    .populate("distributorId", "name businessName")
    .populate("products.productId", "name images")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments({ userId: req.user._id });

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    }, "My orders fetched")
  );
});

/* -------------------- DISTRIBUTOR ORDERS -------------------- */

const getDistributorOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const orders = await Order.find({ distributorId: req.user._id })
    .populate("userId", "name phone")
    .populate("products.productId", "name images")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments({ distributorId: req.user._id });

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    }, "Distributor orders fetched")
  );
});

/* -------------------- UPDATE ORDER STATUS -------------------- */

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, trackingNumber } = req.body;

  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (status === "cancelled" && order.status !== "cancelled") {
    await restoreInventory(order.distributorId, order.products);
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  await order.save();

  return res.status(200).json(
    new ApiResponse(200, order, "Order status updated")
  );
});

/* -------------------- CANCEL ORDER -------------------- */

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (["delivered", "cancelled"].includes(order.status)) {
    throw new ApiError(400, "Order cannot be cancelled");
  }

  await restoreInventory(order.distributorId, order.products);

  order.status = "cancelled";
  await order.save();

  return res.status(200).json(
    new ApiResponse(200, order, "Order cancelled & inventory restored")
  );
});

/* -------------------- EXPORTS -------------------- */

export {
  createOrderFromCart,
  getOrderById,
  getMyOrders,
  getDistributorOrders,
  updateOrderStatus,
  cancelOrder,
};
