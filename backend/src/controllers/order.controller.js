import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { checkReorderNeeded } from "../helpers/reorderCheck.helper.js";

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

/* -------------------- MY ORDERS (customer) -------------------- */

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
  const user=req.user;
  const { page = 1, limit = 10 } = req.query;
  const {
    startDate,          // "2025-01-01"
    endDate,            // "2025-12-31"
    orderStatus,        // "pending" | "delivered" | array bhi chalega
    paymentStatus,      // "paid" | "pending" | "partial"
    customerName,       // search string (partial match)
    orderNumber         // exact or partial
  } = req.body;
  if(!user||user.role!=="distributor"){
    throw new ApiError(401,"Unauthorized user")
  }
  const matchStage={
   distributorId:user._id,
   status:{$ne:"cancelled"}
  };
 if(startDate||endDate){
   matchStage.createdAt={};
   if(startDate) matchStage.createdAt.$gte=new Date(startDate);
if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = end;
    }
 }
if(orderStatus){
  matchStage.status=orderStatus?.toLowerCase().trim();
}
if(paymentStatus){
  matchStage.paymentStatus=paymentStatus?.toLowerCase()
}
if(orderNumber){
  matchStage.orderNumber={$regex:orderNumber,$options:"i"}
}
const skip=(Number(page)-1)*Number(limit);
   const orders=await Order.aggregate([
    {$match:matchStage},
   {
    $lookup:{
      from:"users",
      localField:"userId",
       foreignField:"_id",
       as:"customer"
    }
   },
    {
      $unwind:"$customer"
    },
    {
...(customerName?[
  {
    $match:{
      "customer.name":{$regex:customerName,$options:"i"}
    }
  }
]:[])
    },
    {
     $sort:{createdAt:-1}
    },
   {
    $project:{
     orderNumber:1,
     customerName:"$customer.name",
     orderDate:"$createdAt",
     totalAmount:1,
     paidAmount:{
      $cond:[
        {
          $eq:["$paymentStatus","paid"]
        },
        "$totalAmount",
        0
      ]
     },
     dueAmount:{
      $subtract:[
        "$totalAmount",
       { $cond:[
         { $eq:["$paymentStatus","paid"]},
         "$totalAmount",
         0
        ]}
      ]
     },
     paymentMethod:1,
     orderStatus:"$status",
     paymentStatus:1
    }
   },
   {$skip:skip},
   {
    $limit:Number(limit)
   }
  ])
  return res.status(200).json(new ApiResponse(200,{orders,meta:{currentPage:Number(page),totalOrders:orders.length,totalPages:Math.ceil(Number(totalOrders/Number(limit)))}}))
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

const getPendingOrders=asyncHandler(async(req,res)=>{
  const user=req.user;
  if(!user||user.role!=="distributor"){
    throw new ApiError(401,"Unauthorized user!")
  }
  const {page=1,limit=10,search=""}=req.query
  const skip=(Number(page)-1)*Number(limit);
 const result= await Order.aggregate([
    {
      $match:{
        distributorId:user._id,
        status:{$nin:["delivered","cancelled"]},
        paymentStatus:{$ne:"paid"}
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"userId",
        foreignField:"_id",
        as:"customer"
      }
    },
    {
      $unwind:"$customer"
    },
    {
      $sort:{createdAt:-1}
    },
    ...(search?[{
      $match:{
        $or:[
           { "customer.name":{$regex:search,$options:"i"}},
            {"orderNumber":{$regex:search,$options:"i"}},
          
        ]
      }
    }]:[]),
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: Number(limit) },
          {
            $project: {
              _id: 1,
              orderNumber: 1,
              customerName: "$customer.name",
              customerId: "$customer._id",
              customerPhone: "$customer.phone",
              orderDate: "$createdAt",
              totalAmount: 1,
              paidAmount: { $ifNull: ["$paidAmount", 0] },
              dueAmount: {
                $subtract: [
                  "$totalAmount",
                  { $ifNull: ["$paidAmount", 0] },
                ],
              },
              orderStatus: "$status",
              paymentStatus: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ])
  const pendingOrders = result[0].data;
  const totalOrders = result[0].totalCount[0]?.count || 0;
  return res.status(200).json(new ApiResponse(200,{
        pendingOrders,
        meta: {
          currentPage: Number(page),
          totalOrders,
          totalPages: Math.ceil(totalOrders / Number(limit)),
        }},"Pending order fetched sucessfully"))
})
const  getDeliveredOrders=asyncHandler(async(req,res)=>{
  const user=req.user;
  if(!user||user.role!=="distributor"){
    throw new ApiError(401,"Unauthorized user!")
  }
  const {page=1,limit=10,search=""}=req.query;
  const skip=(Number(page)-1)*Number(limit);
 const result= await Order.aggregate([
    {
      $match:{
        distributorId:user._id,
        status:"delivered"
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"userId",
        foreignField:"_id",
        as:"customer"
      }
    },
    {
      $unwind:"$customer"
    },
    ...(search?[
      {
        $or:[
          {"$customer.name":{$regex:search,$options:"i"}},
          {orderNumber:{$regex:search,$options:"i"}},
        ]
      }
    ]:[]),
    {
      $sort:{deliveredAt:-1,createdAt:-1}
    },
    {
      $facet:{
        data:[
           { $skip: skip },
          { $limit: Number(limit) },
          {
            $project: {
              _id: 1,
              orderNumber: 1,
              customerName: "$customer.name",
              customerPhone: "$customer.phone",
              totalAmount: 1,
              paidAmount: { $ifNull: ["$paidAmount", 0] },
              paymentStatus: 1,
              deliveredAt: 1,
              createdAt: 1,
            },
          },
        ],
        totalCount:[{$count:"count"}]
      }
    }
  ])

  const deliveredOrders = result[0].data;
  const totalOrders = result[0].totalCount[0]?.count || 0;
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deliveredOrders,
        meta: {
          currentPage: Number(page),
          totalOrders,
          totalPages: Math.ceil(totalOrders / Number(limit)),
        },
      },
      "Delivered orders fetched successfully"
    )
  );
})
const getCancelledOrders=asyncHandler(async(req,res)=>{
  const user=req.user;
    if(!user||user.role!=="distributor"){
    throw new ApiError(401,"Unauthorized user!")
  }
  const {page=1,limit=10,search=""}=req.query;
  const skip=(Number(page)-1)*Number(limit);
 const result= await Order.aggregate([
    {
      $match:{
        distributorId:user._id,
        status:"cancelled"
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"userId",
        foreignField:"_id",
        as:"customer",
      }
    },
    {
      $unwind:"$customer"
    },
    ...(search?[
      {
        $or:[
          {"customer.name":{$regex:search,$options:"i"}},
          {orderNumber:{$regex:search,$options:"i"}},
        ]
      }
    ]:[]),
    {
$sort:{cancelledAt:-1,createdAt:-1}
    },
   {
    $facet:{
      data:[
        { $skip: skip },
          { $limit: Number(limit) },
          {
            $project:{
             _id: 1,
              orderNumber: 1,
              customerName: "$customer.name",
              customerPhone: "$customer.phone",
              totalAmount: 1,
              paidAmount: { $ifNull: ["$paidAmount", 0] },
              paymentStatus: 1,
              cancelReason: 1,
              cancelledAt: 1,
              createdAt: 1,
            }
          }
      ],
      totalCount:{$count:"count"},
    }
   }
  ])
  const cancelledOrders = result[0].data;
  const totalOrders = result[0].totalCount[0]?.count || 0;
 return res.status(200).json(
    new ApiResponse(
      200,
      {
        cancelledOrders,
        meta: {
          currentPage: Number(page),
          totalOrders,
          totalPages: Math.ceil(totalOrders / Number(limit)),
        },
      },
      "Cancelled orders fetched successfully"
    )
  );
})


/**
 * CREATE ORDER
 */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const distributorId = req.user._id;
    const {
      userId,
      products,
      shippingAddress,
      paymentMethod = "cod",
      orderNotes
    } = req.body;

    // -------------------- VALIDATION --------------------
    if (!userId || !products || !products.length) {
      throw new ApiError(400, "User & products are required");
    }

    let totalAmount = 0;

    // -------------------- CHECK INVENTORY --------------------
    for (const item of products) {
      const inventory = await Inventory.findOne({
        distributorId,
        productId: item.productId
      }).session(session);

      if (!inventory) {
        throw new ApiError(404, "Inventory not found for product");
      }

      if (inventory.quantity < item.qty) {
        throw new ApiError(
          400,
          `Insufficient stock for product`
        );
      }

      totalAmount += item.totalPrice;
    }

    // -------------------- CREATE ORDER --------------------
    const [order] = await Order.create(
      [{
        distributorId,
        userId,
        products,
        totalAmount,
        shippingAddress,
        paymentMethod,
        orderNotes
      }],
      { session }
    );

    // -------------------- UPDATE INVENTORY + REORDER CHECK --------------------
    for (const item of products) {
      const inventory = await Inventory.findOne({
        distributorId,
        productId: item.productId
      }).session(session);

      inventory.quantity -= item.qty;
      await inventory.save({ session });
      if (inventory.quantity <= inventory.reorderLevel) {
        
        const resultNeeded= await checkReorderNeeded({
          distributorId,
          productId:item.productId,
          session
         })
         if(resultNeeded?.reorderNeeded){
console.log(
          `⚠️ Reorder needed for product ${item.productId}`
        );
         }
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/* -------------------- EXPORTS -------------------- */

export {
  createOrderFromCart,
  getOrderById,
  getMyOrders,
  getDistributorOrders,
  updateOrderStatus,
  cancelOrder,
  getPendingOrders,
  getDeliveredOrders,
  getCancelledOrders
};
