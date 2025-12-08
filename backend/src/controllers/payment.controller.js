import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import axios from "axios"
const CASHFREE_BASE_URL=  process.env.CASHFREE_ENV === "sandbox"
    ? "https://sandbox.cashfree.com/pg/orders"
    : "https://api.cashfree.com/pg/orders";
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { 
    distributorId, 
    userId, 
    products, 
    shippingAddress, 
    orderNotes, 
    paymentMethod,
    customerEmail 
  } = req.body;

  // Validate required fields
  if (!distributorId) {
    throw new ApiError(400, "Distributor ID is required");
  }

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!products || products.length === 0) {
    throw new ApiError(400, "Products are required");
  }

  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required");
  }

  if (!paymentMethod) {
    throw new ApiError(400, "Payment method is required");
  }

  if (!customerEmail) {
    throw new ApiError(400, "Customer email is required");
  }

  // Validate shipping address fields
  const { name, phone, city, state, pincode } = shippingAddress;
  if (!name || !phone  || !city || !state || !pincode) {
    throw new ApiError(400, "Complete shipping address is required (name, phone, address, city, state, pincode)");
  }

  // Validate phone number (10 digits)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ApiError(400, "Invalid phone number. Must be 10 digits starting with 6-9");
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    throw new ApiError(400, "Invalid email address");
  }

  // Validate and calculate product prices
  let totalAmount = 0;
  const updateProducts = [];

  for (const item of products) {
    // Validate product fields
    if (!item.productId?._id) {
      throw new ApiError(400, "Product ID is required for each product");
    }

    if (!item.productId?.name) {
      throw new ApiError(400, "Product name is required");
    }

    const price = Number(item.price);
    const qty = Number(item.qty);

    // Validate price and quantity
    if (isNaN(price) || price <= 0) {
      throw new ApiError(400, `Invalid price for product: ${item.name}`);
    }

    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      throw new ApiError(400, `Invalid quantity for product: ${item.name}. Must be a positive integer`);
    }

    // Check product exists and has sufficient stock
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ApiError(404, `Product not found: ${item.name}`);
    }

    if (!product.status) {
      throw new ApiError(400, `Product is not available: ${product.name}`);
    }

    if (product.stock < qty) {
      throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${qty}`);
    }

    // Check minimum order quantity for wholesale
    if (product.minOrderQty && qty < product.minOrderQty) {
      throw new ApiError(400, `Minimum order quantity for ${product.name} is ${product.minOrderQuantity}`);
    }

    const totalPrice = price * qty;
    totalAmount += totalPrice;

    updateProducts.push({
      productId: item.productId,
      name: item.name,
      price: price,
      qty: qty,
      totalPrice: totalPrice,
      sku: item.sku || product.sku,
      image: item.image || product.images?.[0],
    });
  }

  // Validate total amount
  if (totalAmount <= 0) {
    throw new ApiError(400, "Total amount must be greater than 0");
  }

  // Check if totalAmount exceeds maximum limit (optional)
  const MAX_ORDER_AMOUNT = 1000000; // 10 lakhs
  if (totalAmount > MAX_ORDER_AMOUNT) {
    throw new ApiError(400, `Order amount exceeds maximum limit of ₹${MAX_ORDER_AMOUNT}`);
  }

  try {
    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order in database
    const order = await Order.create({
      distributorId,
      userId,
      products: updateProducts,
      shippingAddress: {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: shippingAddress.country || "India",
      },
      orderNotes: orderNotes?.trim() || "",
      paymentMethod: paymentMethod.toLowerCase().trim(),
      totalAmount: totalAmount,
      orderNumber: orderNumber,
      paymentStatus: "unpaid",
      orderStatus: "pending",
    });

    if (!order) {
      throw new ApiError(500, "Failed to create order");
    }

    console.log("Order Created:", {
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
    });

    // Create Cashfree payment order
    const cashfreePayload = {
      order_id: order.orderNumber,
      order_amount: order.totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_name: name.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: phone.trim(),
      },
      order_note: orderNotes?.trim() || `Payment for order ${order.orderNumber}`,
    };

    console.log("Cashfree Request:", {
      order_id: cashfreePayload.order_id,
      amount: cashfreePayload.order_amount,
    });

    const response = await axios.post(
      CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg/orders",
      cashfreePayload,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    // Validate Cashfree response
    if (!response.data || !response.data.payment_session_id) {
      console.error("Cashfree Response Error:", response.data);
      
      // Delete the created order if Cashfree fails
      await Order.findByIdAndDelete(order._id);
      
      throw new ApiError(500, "Failed to create payment session with Cashfree");
    }

    console.log("Cashfree Response:", {
      order_id: response.data.order_id,
      payment_session_id: response.data.payment_session_id,
    });

    // Update product stock
    for (const item of updateProducts) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.qty } }
      );
    }

    res.status(201).json(
      new ApiResponse(
        201,
        {
          order: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            paymentMode:order.paymentMethod,
          },
          cashfree: {
            payment_session_id: response.data.payment_session_id,
            order_id: response.data.order_id,
          },
        },
        "Order created successfully"
      )
    );

  } catch (error) {
    console.error("Payment Order Creation Error:", error);

    // If order was created but Cashfree failed, try to delete the order
    if (error.response) {
      console.error("Cashfree API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    throw new ApiError(
      500,
      error.response?.data?.message || error.message || "Failed to create payment order"
    );
  }
});
 const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required");
  }

  // Fetch order with payment info populated
  const order = await Order.findOne({ orderNumber: orderId }).populate("paymentInfo");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // If payment not done yet
  if (!order.paymentInfo) {
    return res.status(200).json({
      success: true,
      status: "pending",
      message: "Payment is not completed yet",
    });
  }

  return res.status(200).json({
    success: true,
    status: order.paymentStatus, // "paid" or "unpaid"
    orderNumber: order.orderNumber,
    payment: {
      paymentId: order.paymentInfo.paymentId,
      status: order.paymentInfo.status,
      mode: order.paymentInfo.paymentMode,
      amount: order.paymentInfo.amount,
    },
  });
});

const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    throw new ApiError(400, "Payment ID is required");
  }

  const payment = await Payment.findOne({ paymentId }).populate('orderId');
  
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  res.status(200).json(
    new ApiResponse(200, payment, "Payment details retrieved successfully")
  );
});
const getOrderPaymentStatus = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  if (!orderNumber) {
    throw new ApiError(400, "Order number is required");
  }

  const order = await Order.findOne({ orderNumber }).populate('paymentInfo');
  
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json(
    new ApiResponse(200, {
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentInfo: order.paymentInfo,
    }, "Payment status retrieved successfully")
  );
});
const getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  const query = {};

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const payments = await Payment.find(query)
    .populate('orderId')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Payment.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPayments: count,
    }, "Payments retrieved successfully")
  );
});
export {createPaymentOrder,verifyPayment,getPaymentDetails,getOrderPaymentStatus,getAllPayments,}