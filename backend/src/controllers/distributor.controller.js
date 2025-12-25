import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { DistributorProfile } from "../models/distributorProfile.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ExcelJS from "exceljs"
import crypto from "crypto"
import uploadFileOnCloud from "../utils/Cloudinary.js";
const updateDistributor = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }
  
  if (isLoggedUser.role?.toLowerCase() === "customer") {
    throw new ApiError(403, "Access denied! customer not allowed");
  }
  
  const { businessName, gstNumber, businessEmail, businessPhone, city, state, pincode } = req.body;
  
  const updateFields = {};
  
  // Business Name
  if (businessName !== undefined) {
    if (!businessName?.trim()) {
      throw new ApiError(400, "Business name cannot be empty!");
    }
    updateFields.businessName = businessName.trim();
  }
  
  // Business Email
  if (businessEmail !== undefined) {
    if (!businessEmail?.trim()) {
      throw new ApiError(400, "Business email cannot be empty!");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(businessEmail)) {
      throw new ApiError(400, "Invalid email format!");
    }
    updateFields.businessEmail = businessEmail.trim().toLowerCase();
  }
  
  // Business Phone
  if (businessPhone !== undefined) {
    const phoneStr = businessPhone.toString().trim();
    if (!phoneStr) {
      throw new ApiError(400, "Business phone cannot be empty!");
    }
    if (!/^\d{10}$/.test(phoneStr)) {
      throw new ApiError(400, "Business phone must be 10 digits!");
    }
    updateFields.businessPhone = phoneStr;
  }
  
  // GST Number
  if (gstNumber !== undefined) {
    const gstStr = gstNumber.toString().trim();
    if (!gstStr) {
      throw new ApiError(400, "GST number cannot be empty!");
    }
    updateFields.gstNumber = gstStr.toUpperCase();
  }
  
  // City
if (city !== undefined) {
  if (!city?.trim()) {
    throw new ApiError(400, "City cannot be empty!");
  }

  updateFields.businessAddress = updateFields.businessAddress || {};
  updateFields.businessAddress.city = city.trim().toLowerCase().replace(/\s+/g, "");
}
  
  // State
if (state !== undefined) {
  if (!state?.trim()) {
    throw new ApiError(400, "State cannot be empty!");
  }

  updateFields.businessAddress = updateFields.businessAddress || {};
  updateFields.businessAddress.state = state.trim().toLowerCase().replace(/\s+/g, "");
}
  
  // Pincode
if (pincode !== undefined) {
  const pincodeStr = pincode.toString().trim();
  if (!pincodeStr) {
    throw new ApiError(400, "Pincode cannot be empty!");
  }
  if (!/^\d{6}$/.test(pincodeStr)) {
    throw new ApiError(400, "Pincode must be 6 digits!");
  }

  updateFields.businessAddress = updateFields.businessAddress || {};
  updateFields.businessAddress.pincode = pincodeStr;
}
  
  // Check if at least one field is provided
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "At least one field is required to update!");
  }
  
  // Update distributor
  const updatedDistributor = await DistributorProfile.findOneAndUpdate(
    {userId:isLoggedUser._id}, 
    { $set: updateFields },
    { new: true }
  );
  
  if (!updatedDistributor) {
    throw new ApiError(404, "Distributor not found!");
  }
  
  return res.status(200).json(
    new ApiResponse(
      200,
      updatedDistributor,
      "Distributor updated successfully"
    )
  );
});
const getDistributorProducts = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10, search = "" } = req.query;

  if (!user) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (user.role.toLowerCase() === "customer") {
    throw new ApiError(403, "Access denied for customer");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const query = { createdBy: user._id };

  // if (search.trim()) {
  //   query.$or = [
  //     { name: { $regex: search, $options: "i" } },
  //     { sku: { $regex: search, $options: "i" } },
  //     { brand: { $regex: search, $options: "i" } },
  //   ];
  // }

  // const [total, allProducts] = await Promise.all([
  //   Product.countDocuments(query),
  //   Product.find(query, {
  //     name: 1,
  //     price: 1,
  //     wholesalePrice: 1,
  //     thumbnail: 1,
  //     brand: 1,
  //     status: 1,
  //     sku: 1,
  //     category: 1,
  //     unit: 1,
  //     unitsPerBase: 1,
  //   })
  //     .populate("category", "name")
  //     .sort({ createdAt: -1 })
  //     .skip(skip)
  //     .limit(Number(limit)),
  // ]);

  // const productIds = allProducts.map((p) => p._id);

  // const stockArr = await Inventory.find({
  //   productId: { $in: productIds },
  //   distributorId: user._id,
  //   quantity:{$gt:10},
  // }).select("productId quantity");
  // const stockMap = {};
  // stockArr.forEach((s) => {
  //   stockMap[s.productId.toString()] = s.quantity;
  // });

  // const products = allProducts.map((p) => ({
  //   ...p._doc,
  //   stock: stockMap[p._id.toString()] || 0,
  // }));

  const productsResult=await Inventory.aggregate([
    {
      $match:{
        distributorId:user._id,
        quantity:{$gt:10}
      }
    },
    {
      $lookup:{
        from:"products",
        localField:"productId",
        foreignField:"_id",
        as:"product"
      }
    },
    {
      $unwind:"$product"
    },
    ...(search?[
      {
        $match:{
          $or:[
            {"product.name":{$regex:search,$options:"i"}},
              { "product.sku": { $regex: search, $options: "i" } },
              { "product.brand": { $regex: search, $options: "i" } },
          ]
        }
      }
    ]:[]),
    {
       $facet: {
      data: [
        {
          $project: {
            _id:0,
            quantity: 1,
            "product._id":1,
            "product.name": 1,
            "product.price": 1,
            "product.wholesalePrice": 1,
            "product.thumbnail": 1,
            "product.brand": 1,
            "product.status": 1,
            "product.sku": 1,
            "product.unit":1,
            "product.unitsPerBase":1,
            "product.category": 1,
            "product.createdAt": 1,
          },
        },
        { $sort: { "product.createdAt": -1 } },
        { $skip: Number(skip) },
        { $limit: Number(limit) },
      ],
      total: [
        { $count: "count" },
      ],
    },
    }
     
  ])
  if(!productsResult.length){
    throw new ApiError(404,"Products not found!")
  }
  const products = productsResult[0]?.data || [];
  const totalProducts = productsResult[0]?.total[0]?.count || 0;
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total:totalProducts,
          totalPages: Math.ceil(totalProducts / Number(limit)),
        },
      },
      "Products fetched successfully"
    )
  );
});

const getDistributorProductById = asyncHandler(async (req, res) => {
  const user = req.user;
  const { productId } = req.params;

  if (!user) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (user.role.toLowerCase() === "customer") {
    throw new ApiError(403, "Access denied - not allowed for customer!");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // Fetch product (ownership check included)
  const product = await Product.findOne({
    _id: productId,
    createdBy: user._id,
  })
    .populate("category", "name")
    .populate("createdBy", "name email");

  if (!product) {
    throw new ApiError(404, "Product not found!");
  }

  // Fetch inventory (SAFE)
  const inventory = await Inventory.findOne({
    productId: product._id,
    distributorId: user._id,
  }).select("quantity");

  const stock = inventory?.quantity || 0; 

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
        stock,
      },
      "Product fetched successfully"
    )
  );
});

//Order managenents--
const getDistributorOrders = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;

  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access-denied only for distributor!");
  }


  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter = { distributorId: isLoggedUser._id };

  // DATE RANGE FILTER
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // STATUS FILTER
  if (status) {
    filter.status = status.toLowerCase();
  }

  // SEARCH (orderNumber + customer name/email/phone)
  if (search) {
    const matchingUsers = await User.find({
      role: "customer",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { userId: { $in: userIds } },
    ];
  }

  // COUNT
  const total = await Order.countDocuments(filter);

  if (!total) {
    return res.status(200).json(
      new ApiResponse(200, {
        currentPage: 1,
        totalPages: 0,
        totalOrders: 0,
        orders: [],
        stats: [],
      }, "No orders found")
    );
  }

  // DATA
  const orders = await Order.find(filter)
    .select(
      "orderNumber userId products totalAmount status paymentStatus paymentMethod shippingAddress orderNotes trackingNumber createdAt deliveredAt"
    )
    .populate("userId", "name email phone")
    .populate("products.productId", "name thumbnail sku wholesalePrice")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // STATS
  const stats = await Order.aggregate([
    { $match: { distributorId: isLoggedUser._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalOrders: total,
        orders,
        stats,
      },
      "Orders fetched successfully"
    )
  );
});

const getDistributorOrderById=asyncHandler(async(req,res)=>{
const isLoggedUser=req.user;
 if(!isLoggedUser){
      throw new ApiError(401,"Unauthorized user!please login")
    }
    const {orderId}=req.params;
      if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }
  
  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access denied - only for distributors!");
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }
 const order= await Order.find({
    _id:orderId,
    distributorId:isLoggedUser._id
  }).populate("userId","name email phone address profilePic")
  .populate("products.productId","name description thumbnail images sku brand category wholesalePrice price stock")
  .populate("paymentInfo")
     if (!order) {
    throw new ApiError(404, "Order not found or access denied!");
  }
  const timeline=[];
  if(order.createdAt){
    timeline.push({
      status:"Order Placed",
      timestamp:order.createdAt,
       description: 'Order has been placed successfully'
    })
  }
  if(order.confirmedAt){
    timeline.push({
      status:'Confirmed',
      timestamp:order.confirmedAt,
       description: 'Order confirmed by distributor'
    })
  }
  if(order.shippedAt){
    timeline.push({
      status:'Shipped',
      timestamp:order.shippedAt,
      description:`Order shipped ${order.trackingNumber}? - Tracking: ${order.trackingNumber}:' '`
    })
  }
  if(order.deliveredAt){
    timeline.push({
      status:'Delivered',
      timstamp:order.deliveredAt,
         description: 'Order delivered successfully'
    })
  }
  if(order.cancelledAt){
    timeline.push({
      status:'Cancelled',
      timestamp:order.cancelledAt,
      description:'Order has been cancelled'
    })
  }
  return res.status(200).json(new ApiResponse(200,{
    order,
    timeline
  },"Order details fetched successfully"))
})
const OrderStatusChange=asyncHandler(async(req,res)=>{
const isLoggedUser=req.user;
const {orderId}=req.params
const {status,trackingNumber}=req.body;
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }
  
  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access denied - only for distributors!");
  }
  // Validate orderId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }
  if(!status){
    throw new ApiError(400,"Status is required!")
  }
  const allowedStatuses=["pending","confirmed","shipped","delivered","cancelled"]
  const newStatus=status.toLowerCase();
  if(!allowedStatuses.includes(newStatus)){
    throw new ApiError(400,"Invalid status value!")
  }
  const order=await Order.findOne({_id:orderId,
    distributorId:isLoggedUser._id
  })
  if(!order){
    throw new ApiError(404,"order not found!")
  }
  const currentStatus=order.status;
  const validTransitions={
    pending:["confirmed","cancelled"],
    confirmed:["shipped","cancelled"],
    shipped:["delivered"],
    delivered:[],
    cancelled:[],
  }
  if(!validTransitions[currentStatus]?.includes(newStatus)){
    throw new ApiError(400, `Invalid status update! Order is currently '${currentStatus}' and cannot move to '${newStatus}'`)
  }
  order.status=newStatus;
 switch (newStatus) {
  case 'confirmed':
    order.confirmedAt=new Date();
    break;
   case "shipped":
      if (!trackingNumber) {
        throw new ApiError(400, "Tracking number is required when shipping!");
      }
      order.shippedAt = new Date();
      order.trackingNumber = trackingNumber;
      break;
  case 'delivered':
    order.deliveredAt=new Date()
    break;
  case 'cancelled':
    order.cancelledAt=new Date()
    break;
 }
 await order.save();
 return res.status(200).json(new ApiResponse(200,order,`Order status updated to ${newStatus} successfully`))
})
const cancelOrder=asyncHandler(async(req,res)=>{

})
const getOrdersByStatus=-asyncHandler(async(req,res)=>{

})
//customer Management
const getDistributorscustomers = asyncHandler(async (req, res) => {
  console.log("congtroller");
  const isLoggedUser = req.user;
  const { page=1, limit = 10, search='' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  // 1. Authentication
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  // 2. Authorization (Only distributors can access)
  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access-denied! Only distributor allowed");
  }

  // 3. Base Query
  const baseQuery = {
    distributorId: isLoggedUser._id,
    role: "customer",
  };

  // 4. Search filter
  if (search) {
    baseQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  // 5. Count total customers
  const totalcustomers = await User.countDocuments(baseQuery);

  if (!totalcustomers) {
    throw new ApiError(404, "customers not found!");
  }

  // 6. Fetch customer list
  const customers = await User.find(
    baseQuery,
    { name: 1, email: 1, phone: 1 }
  )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // 7. Response
  return res.status(200).json(
    new ApiResponse(200, {
      total: totalcustomers,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalcustomers / limit),
      customers,
    }, "customers fetched successfully")
  );
});

const getcustomerById = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { customerId } = req.params;

  // 1. Not logged in
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  // 2. Only Distributor can access customer
  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access-denied! Only distributors allowed");
  }

  // 3. Validate customerId
  if (!customerId) {
    throw new ApiError(400, "customer ID is required");
  }

  // 4. Fetch customer (must belong to distributor)
  const customer = await User.findOne(
    {
      _id: customerId,
      role: "customer",
      distributorId: isLoggedUser._id, // Only their own customer
    },
    {
      name: 1,
      email: 1,
      phone: 1,
      address:1,
      createdAt: 1,
    }
  );

  // 5. Not found
  if (!customer) {
    throw new ApiError(404, "customer not found or not linked to this distributor");
  }

  // 6. Send response
  return res.status(200).json(
    new ApiResponse(200, customer, "customer fetched successfully")
  );
});

const approvecustomer = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { customerId } = req.params;

  // 1. Authentication check
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  // 2. Only distributors can approve customers
  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access denied! Only distributors can approve customers.");
  }

  // 3. customer ID validation
  if (!customerId) {
    throw new ApiError(400, "customer ID is required");
  }

  // 4. Find the customer (must belong to this distributor)
  const customer = await User.findOne({
    _id: customerId,
    role: "customer",
    distributorId: isLoggedUser._id,
  });

  if (!customer) {
    throw new ApiError(
      404,
      "customer not found or not associated with this distributor"
    );
  }

  // 5. Already approved?
  if (customer.status === "approved") {
    throw new ApiError(400, "customer is already approved");
  }

  // 6. Update status
  customer.status = "approved";
  await customer.save();

  // 7. Success response
  return res.status(200).json(
    new ApiResponse(200, customer, "customer approved successfully")
  );
});

// const getcustomerOrders=as(async(req,res)=>{

// })


//Profiles
const getCompanyProfile=asyncHandler(async(req,res)=>{
const isLoggedUser=req.user;
if(!isLoggedUser){
  throw new ApiError(401,"Unauthorized user!please login")
}
if(isLoggedUser.role.toLowerCase()!=="distributor"){
  throw new ApiError(403,"Access-denied only allowed distributor!")
}
 const distributor = await DistributorProfile.findOne(
    {userId:isLoggedUser._id},
    {
      businessName: 1,
      businessEmail: 1,
      businessPhone: 1,
      businessAddress: 1,
      documents:1,
      approval: 1,
      gstNumber: 1,
      isActive: 1,
      status: 1,
    }
  ).populate("userId","name").populate("approval.approvedBy","name");
    if (!distributor) {
    throw new ApiError(404, "Distributor profile not found!");
  }
    return res.status(200).json(
    new ApiResponse(200, distributor, "Distributor profile fetched successfully")
  );

})

const getNotification=asyncHandler(async(req,res)=>{

})

//Inventory Management

// const getInventoryReports=asyncHandler(async(req,res)=>{
// const isLoggedUser=req.user;

//   const {page=1,limit=10,search=""}=req.body;
//   const pageNumber=Number(page)
//   const skip=(pageNumber-1)*Number(limit)
// if(!isLoggedUser){
//   throw new ApiError(401,"Unauthorized user!please login")
// }
// if(isLoggedUser.role.toLowerCase()!=="distributor"){
//   throw new ApiError(403,"Access-denied only allowed distributor!")
// }
// const filter={};
// if(isLoggedUser.role.toLowerCase()==="distributor"){
//   filter.distributorId=isLoggedUser._id
// }
// let productIds=[];
// if(search){
// const products=await Product.find({
//   $or:[{name:{$regex:search,$options:"i"}},
//   {brand:{$regex:search,$options:"i"}}],
//    distributorId:isLoggedUser._id,
// }).select("_id")



// productIds=products.map(p=>p._id);
// const categories=await Category.find({
//   name:{$regex:search,$options:"i"}
// }).select("_id")



// const categoriesIds=categories.map(c=>c._id)
// if(categories.length>0){
//   const categoryProducts=await Product.find({
//    category:{$in:categoriesIds}
//   })
//   const categoryProductsIds=categoryProducts.map(cp=>cp._id)

//     productIds=[...new Set([...productIds,...categoryProductsIds])];
//     if(productIds.length>0){
//       filter.productId={$in:productIds}
//     }else{
//       filter.productId={$in:[]}
//     }
// }
// }
// const total=await Inventory.countDocuments(filter);

// const lowStockProducts=await Inventory.aggregate([
//   {
//     $match:{
//       distributorId:isLoggedUser._id,
//       quantity:{$lte:10}
//     }
//   },
//   {
//     $group:{
//       _id:"$productId",
//       totalStock:{$sum:"$quantity"}
//     }
//   },
//   {
//     $match:{
//       totalStock:{$lte:10}
//     }
//   },
//   {
//     $lookup:{
//       from:"products",
//       localField:"productId",
//       foreignField:"_id",
//       as:"product"
//     }
//   },
//   {
//     $unwind:"$product"
//   },
//   {
//     $lookup:{
//       from:"categories",
//       localField:"product.category",
//       foreignField:"_id",
//       as:"category"
//     }
//   },
//   {
//     $unwind:"$category"
//   },
//   {
//     $group:{
//       _id:"$product.category",
//       catName:{$first:"$category.name"},
//       totalLowStockProducts:{$addToSet:"$productId"},
//       lowStockProducts:{
//         $push:{
//           productId:"$productId",
//          productName:"$product.name",
//           stock:"$quantity",
//           brand:"$product.brand",
//         }
//       }
//     }
//   },
//   {
//     $project:{
//       _id: 0,
//       categoryId: "$_id",
//       catName: 1,
//       totalLowStockProducts: { $size: "$totalLowStockProducts" },
//       lowStockProducts: 1,
//     }
//   }
// ])
// const categorySummary=await Inventory.aggregate([
//   {
//     $match:{
//       distributorId:isLoggedUser._id,
//     }
//   },
//   {
//     $lookup:{
//       from:"products",
//       localField:"productId",
//       foreignField:"_id",
//       as:"product"
//     }
//   },
//   {
//     $unwind:"$product"
//   },
//   {
//     $lookup:{
//       from:"categories",
//       localField:"$product.category",
//       foreignField:"_id",
//       as:"category",
//     }
//   },
//   {
//     $unwind:"$category",
//   },
//   {
//     $group:{
//       _id:"$category._id",
//       totalProducts:{$sum:1},
//        categoryName: { $first: "$category.name" },
//       products: { $addToSet: "$product._id" },
//       totalStock: { $sum: "$quantity" }
//     }
//   },
//    {
//     $project: {
//       _id: 0,
//       categoryId: "$_id",
//       categoryName: 1,
//       totalProducts: { $size: "$products" },
//       totalStock: 1
//     }
//   }
// ])
//  const inventoryList = await Inventory.find(filter)
//     .populate("productId", "name price stock brand category")
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, {
//         total,
//         lowStockProducts,
//         categorySummary,
//         inventoryList,
//       })
//     );
// })
/* ================= HELPERS ================= */

async function getProductIdsForSearch(search, distributorId) {
  const products = await Product.find({
    createdBy: distributorId,
    $or: [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ],
  }).select("_id");

  let productIds = products.map(p => p._id);

  const categories = await Category.find({
    name: { $regex: search, $options: "i" },
  }).select("_id");

  if (categories.length > 0) {
    const categoryProducts = await Product.find({
      category: { $in: categories.map(c => c._id) },
      createdBy: distributorId,
    }).select("_id");

    productIds = [...new Set([
      ...productIds,
      ...categoryProducts.map(p => p._id),
    ])];
  }

  return productIds;
}

async function getLowStockProductsByCategory(distributorId) {
  // return Inventory.aggregate([
  //   {
  //     $match: {
  //       distributorId,
  //       quantity: { $lte: 10 },
  //     },
  //   },

  //   // join product
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "productId",
  //       foreignField: "_id",
  //       as: "product",
  //     },
  //   },
  //   { $unwind: "$product" },

  //   // join category
  //   {
  //     $lookup: {
  //       from: "categories",
  //       localField: "product.category",
  //       foreignField: "_id",
  //       as: "category",
  //     },
  //   },
  //   { $unwind: "$category" },

  //   // 🔑 explicitly define fields
  //   {
  //     $addFields: {
  //       categoryId: "$category._id",
  //       categoryName: "$category.name", 
  //     },
  //   },

  //   // group by category
  //   {
  //     $group: {
  //       _id: "$categoryId",
  //       categoryName: { $first: "$categoryName" },
  //       products: {
  //         $push: {
  //           productId:"$product._id",
  //           productName: "$product.name",
  //           brand: "$product.brand",
  //           stock: "$quantity",
  //         },
  //       },
  //     },
  //   },

  //   // final shape
  //   {
  //     $project: {
  //       _id: 0,
  //       categoryId: "$_id",
  //       categoryName: 1,
  //       totalLowStockProducts: { $size: "$products" },
  //       products: 1,
  //     },
  //   },

  //   { $sort: { totalLowStockProducts: -1 } },
  // ]);
    return  Inventory.aggregate([
      {
        $match:{
          distributorId,
          quantity:{$lte:10}
        }
      },
      {
        $lookup:{
          from:"products",
          localField:"productId",
          foreignField:"_id",
          as:"product"
        }
      },
      {
        $unwind:"$product"
      },
      {
        $lookup:{
          from:"categories",
          localField:"product.category",
          foreignField:"_id",
          as:"category"
        }
      },
      {
        $unwind:"$category"
      },
      {
        $group:{
          _id:"$category._id",
          categoryName:{$first:"$category.name"},
         products:{
          $push:{
            productName:"$product.name",
            quantity:"$quantity",
          }
         },
         totalLowProducts:{
          $sum:1,
         }
        }
      },
      
      {
        $project:{
          _id:0,
          categoryName:1,
          categoryId:"$_id",
          products:1,
          totalLowProducts:1,
          total:1
        }
      },
      {
        $sort:{totalLowProducts:-1}
      }

    ])
}


async function getCategorySummary(distributorId) {
  // return Inventory.aggregate([
  //   { $match: { distributorId } },
  //   {
  //     $lookup: {
  //       from: "products",
  //       localField: "productId",
  //       foreignField: "_id",
  //       as: "product",
  //     },
  //   },
  //   { $unwind: "$product" },
  //   {
  //     $lookup: {
  //       from: "categories",
  //       localField: "product.category",
  //       foreignField: "_id",
  //       as: "category",
  //     },
  //   },
  //   { $unwind: "$category" },
  //   {
  //     $group: {
  //       _id: "$category._id",
  //       categoryName: { $first: "$category.name" },
  //       totalProducts: { $addToSet: "$product._id" },
  //       totalStock: { $sum: "$quantity" },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       categoryId: "$_id",
  //       categoryName: 1,
  //       totalProducts: { $size: "$totalProducts" },
  //       totalStock: 1,
  //     },
  //   },
  //   { $sort: { totalStock: -1 } },
  // ]);
  return Inventory.aggregate([
    {
      $match:{
        distributorId,
      }
    },
    {
       $lookup:{
        from :"products",
        localField:"productId",
        foreignField:"_id",
        as:"product"
       }
    },
    {
      $unwind:"$product",
    },
    {
      $lookup:{
        from:"categories",
        localField:"product.category",
        foreignField:"_id",
        as:"category"
      }
    },
    {
      $unwind:"$category"
    },
    {
      $group:{
        _id:"$category._id",
        categoryName:{$first:"$category.name"},
        totalStockItems:{
          $sum:1,
        },
        lowStockItems:{
          $sum:{
            $cond:[{$lte:["$quantity",10]},1,0],
          }
        },
        inStockItems:{
          $sum:{
            $cond:[{$gt:["$quantity",10]},1,0]
          }
        }
      }
    },
    {
      $project:{
        _id:0,
        categoryId:"$_id",
        categoryName:1,
        totalStockItems:1,
        lowStockItems:1,
        inStockItems:1
      }
    },
    {
      $sort:{lowStockItems:-1},
    }
  ])
  
}
async function getInventoryList(distributorId){
  return Inventory
}


const getDashboardReports = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10, search = "" } = req.query;

  if (!user) throw new ApiError(401, "Unauthorized");
  if (user.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Only distributors allowed");
  }

  const distributorId = user._id;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { distributorId };

  // if (search) {
  //   const productIds = await getProductIdsForSearch(search, distributorId);
  //   if (productIds.length > 0) {
  //     filter.productId = { $in: productIds };
  //   } else {
  //     return res.status(200).json(
  //       new ApiResponse(200, {
  //         total: 0,
  //         lowStockProducts: [],
  //         categorySummary: [],
  //         inventoryList: [],
  //       }, "No inventory found")
  //     );
  //   }
  // }

  const [
    totalProducts,
    lowCategoryProducts,
    categorySummary,
    inventoryList,
  ] = await Promise.all([
    Inventory.countDocuments(filter),
    getLowStockProductsByCategory(distributorId),
    getCategorySummary(distributorId),
    Inventory.find(filter)
      .populate("productId", "name price brand category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalProducts,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalProducts / Number(limit)),
      lowCategoryProducts,
      categorySummary,
      inventoryList,
    }, "Inventory report fetched successfully")
  );
});




const updateWholesalePricing=asyncHandler(async(req,res)=>{
const user=req.user;
const {ids}=req.body
if(!user){
  throw new ApiError(401,"Unauthorized user!please login")
}
if(user.role.toLowerCase()!=="distributor"){
  throw new ApiError(403,"Access-denied only distributor allowed!")
}
if(!Array.isArray(ids)&&ids.length===0){
  throw new ApiError(400,"product id is required!")
}
// [{
//   productID,price,wholesalePrice
// }]
  let validItems = [];
  let invalidIds = [];

  ids.forEach((item) => {
    if (mongoose.isValidObjectId(item.productId)) {
      validItems.push(item);
    } else {
      invalidIds.push(item.productId);
    }
  });

if(validItems.length===0){
  throw new ApiError(400,"No valid product provided!")
}
const updatePromise=validItems.map((item)=>{
  return Product.findByIdAndUpdate(item.productId,
{
  price: Number(item.price),
        wholesalePrice: Number(item.wholesalePrice),
},
{
  new:true,
  runValidators:true
})
})
const result=await Promise.allSettled(updatePromise);
const successUpdate=[];
const failedUpdate=[];
result.forEach((res,index)=>{
  if(res.status==="fulfilled"&&res.value){
    successUpdate.push(res.value)
  }else{
    failedUpdate.push({
      id: validItems[index].productId,
      reason:res.reason?.message||"Product not found"
    })
  }
})
 if (successUpdate.length === 0) {
      throw new ApiError(404, "No products found with given IDs!");
    }
   return res.status(200).json(
      new ApiResponse(
        200,
        {
          updatedCount: successUpdate.length,
          products: successUpdate,
          failed: failedUpdate,
          invalidIds: invalidIds
        },
        `${successUpdate.length} product(s) verified successfully`
      )
    );
})
const exportsProductsToExcel=asyncHandler(async(req,res)=>{
  const user=req.user;
  if(!user){throw new ApiError(401,"Unauthorized user!please login")}
  if(user.role.toLowerCase()!=="distributor"){
    throw new ApiError(403,"Access-denied only distributor allowed!")
  }
 const products= await Product.find({distributorId:user._id});
 if(!products){
  throw new ApiError(404,"No product found for exports!")
 }
  const workBook=new ExcelJS.Workbook()
  const sheet=workBook.addWorksheet("products")
  sheet.columns=[
    {
      header:"S.No",key:"sno",width:10,
    },
    {
      header:"Product Id",key:"id",width:25
    },
    {
      header:"Name",key:"name",width:30
    },
    {
      header:"Price",key:"price",width:15
    },
    {
      header:"Wholesale Price",key:"wholePrice",width:15
    },
    {
      header:"Stock",key:"stock",width:15
    },
    {
      header:"createdAt",key:"createdAt",width:20
    }
  ]
   products.map((p,index)=>{
    sheet.addRow({
      sno:index+1,
      id:p._id.toString(),
      name:p.name,
      price:p.price,
      wholePrice:p.wholesalePrice,
      stock:p.stock,
      createdAt:p.createdAt.toISOString().split('T')[0]
    })
   })
   const filename=`products_${Date.now()}.xlsx`;
   res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
   res.setHeader("Content-Disposition",`attachment; filename=${filename}`);
   await workBook.xlsx.write(res);
   res.status(200).end()
})
// customer.controller.js
const getAllApprovedDistributors = asyncHandler(async (req, res) => {
    const { search = "" } = req.query; // search query from frontend

    // Build filter
    const filter = {
        status: "approved",
        $or: [
            { businessName: { $regex: search, $options: "i" } },
            { "businessAddress.city": { $regex: search, $options: "i" } },
            { "businessAddress.state": { $regex: search, $options: "i" } }
        ]
    };

    const distributors = await DistributorProfile.find(filter)
        .select("businessName userId")
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, distributors, "Approved distributors fetched successfully"));
});
const uploadDistributorDocs = asyncHandler(async (req, res) => {
  const user = req.user; // Must be logged-in distributor
  if (user.role !== "distributor") throw new ApiError(403, "Only distributors allowed");

  const distributorProfile = await DistributorProfile.findOne({ userId: user._id });
  if (!distributorProfile) throw new ApiError(404, "Distributor profile not found");

  // Example: upload files
  if (req.files?.length) {
    const uploadedDocs = [];
    for (const file of req.files) {
      const uploaded = await uploadFileOnCloud(file.path);
      uploadedDocs.push({
        docType: file.fieldname,
        docUrl: uploaded?.url,
        verified: false,
      });
      fs.unlinkSync(file.path);
    }
    distributorProfile.documents.push(...uploadedDocs);
  }

  await distributorProfile.save();
  return res.status(200).json(new ApiResponse(200, distributorProfile, "Documents uploaded successfully"));
});


/**
 * UPLOAD DOCUMENTS (Multiple)
 */
 const uploadDistributorDocuments = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized user!");

  const files = req.files; // Expecting multiple
  if (!files || files.length === 0) {
    throw new ApiError(400, "At least one document file is required!");
  }

  const distributor = await DistributorProfile.findOne({ userId: user._id });
  if (!distributor) throw new ApiError(404, "Distributor profile not found!");

  const uploadedDocs = [];

  for (const file of files) {
    const uploaded = await uploadFileOnCloud(file.path);
    if (!uploaded) {
      throw new ApiError(500, "File upload failed!");
    }

    uploadedDocs.push({
      docType: file.mimetype,
      docUrl: uploaded,
      verified: false,
    });
  }

  distributor.documents.push(...uploadedDocs);
  await distributor.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { documents: distributor.documents },
      "Documents uploaded successfully"
    )
  );
});

/**
 * DELETE DOCUMENT
 */
 const deleteDistributorDocument = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Unauthorized user!");

  const { docId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(docId)) {
    throw new ApiError(400, "Invalid document ID!");
  }

  const distributor = await DistributorProfile.findOne({ userId: user._id });
  if (!distributor) throw new ApiError(404, "Distributor not found!");

  const doc = distributor.documents.id(docId);
  if (!doc) {
    throw new ApiError(404, "Document not found!");
  }

  // Delete file from cloud
  await deleteFileOnCloud(doc.docUrl);

  // Remove document from array
  doc.deleteOne();
  await distributor.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { documents: distributor.documents },
      "Document deleted successfully"
    )
  );
});

/**
 * VERIFY DOCUMENT (Admin Only)
 */
const verifyDistributorDocument = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role !== "admin") {
    throw new ApiError(403, "Only admin can verify documents!");
  }

  const { docId } = req.params;
  const { distributorId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(docId) || !distributorId) {
    throw new ApiError(400, "Invalid input!");
  }

  const distributor = await DistributorProfile.findOne({ userId: distributorId });
  if (!distributor) throw new ApiError(404, "Distributor not found!");

  const doc = distributor.documents.id(docId);
  if (!doc) throw new ApiError(404, "Document not found!");

  doc.verified = true;
  doc.verifiedBy = user._id;
  doc.verifiedAt = new Date();

  await distributor.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      doc,
      "Document verified successfully"
    )
  );
});
const getTopcustomers = asyncHandler(async (req, res) => {
  const distributorId = req.user._id;

  if (!distributorId) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  // Distributor check
  if (req.user.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access denied! Only distributors allowed.");
  }

  const customers = await Order.aggregate([
    {
      $match: { distributorId: distributorId }
    },
    {
      $group: {
        _id: "$userId",
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "customer"
      }
    },
    {
      $unwind: "$customer"
    },
    {
      $project: {
        _id: 0,
        customerId: "$customer._id",
        name: "$customer.name",
        email: "$customer.email",
        totalOrders: 1,
        revenue: "$totalRevenue"
      }
    },
    {
      $sort: { revenue: -1 }  // Highest revenue first
    },
    {
      $limit: 10  // Top 10 customers
    }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      customers,
      "Top customers fetched successfully"
    )
  );
});

const getCustomersInsights=asyncHandler(async(req,res)=>{
   const user=req.user;
   if(!user||user.role==="customer"){
    throw new ApiError(401,"Access denied only distributor allowed!")
   }
   const {page=1,limit=10,search=""}=req.query;
   const skip=(Number(page) - 1)*Number(limit);
 const orderCustomers=  await Order.aggregate([
    {
      $match:{
        distributorId:user._id,
        status:{$ne:"cancelled"}
      }
    },
    {
      $group:{
        _id:"userId",
        totalOrders:{$sum:1},
        totalSpent:{$sum:"$totalAmount"},
        outStanding:{
          $sum:{
            $cond:[
              {$in:["$paymentStatus",["unpaid","partially_paid"]]},
                 "$totalAmount",
                 0
            ]
          }
        },
       lastOrderDate:{$max:"$createdAt"},
       
      }
    },
    {
     $lookup:{
      from:"users",
      localField:"_id",
      foreignField:"_id",
      as:"customer"
     }
    },
    {
      $unwind:"$customer"
    },
    ...(search?[
     {
      $match:{
        $or:[
          {
            "$customer.name":{$regex:search,$options:"i"}
          },
          {
            "$customer.phone":{$regex:search,$options:"i"}
          },
          {
            "$customer.email":{$regex:search,$options:"i"}
          }
        ]
      }
     }

    ]:[]),
    {
      $project:{
        _id:0,
        customerId:"$_id",
        name:"$customer.name",
        phone:"$customer.phone",
        email:"$customer.email",
        totalOrders:1,
        totalSpent:1,
        outStanding:1,
        lastOrderDate:1,
      }
    },
    {
      $skip:Number(skip)
    },
    {
      $limit:Number(limit)
    }
   ])
   const Customers=orderCustomers.data;
   const totalCustomers=orderCustomers.length;
   return res.status(200).json(new ApiResponse(200,{customers:orderCustomers,meta:{
    currentPage:Number(page),
    totalPages:Math.ceil(Number(totalCustomers)/Number(limit)),
    totalCustomers,
   }},"All customer fetched successfully"))
})
const getCustomersDirectory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10, search = "" } = req.query;
  if (!user || user.role !== "distributor") {
    throw new ApiError(401, "Access denied! Only distributor allowed.");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const query = {
    role: "customer",
    distributorId: user._id,
  };

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }


  const customers = await User.find(query)
    .select("name phone email status createdAt")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const totalCustomers = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      customers,
      meta: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCustomers / limit),
        totalCustomers,
      },
    }, "Customers fetched successfully")
  );
});
const addcustomer = asyncHandler(async (req, res) => {
  const distributor = req.user;

  if (!distributor) {
    throw new ApiError(401, "Unauthorized user!");
  }

  if (distributor.role !== "distributor") {
    throw new ApiError(403, "Only distributors can add customers!");
  }

  const { name, email, phone, gender, city, pincode,state } = req.body;

  // Validate fields
  if ([name, email, phone, gender, city, pincode].some(f => !f?.trim())) {
    throw new ApiError(400, "All fields are required!");
  }
 const normalizedEmail=email?.toLowerCase().trim()
 const normalizedPhone=phone?.trim()

  // Check email exists
const exists=await User.findOne({
  distributorid:distributor._id,
  role:"customer",
  $or:[
    {
      phone:normalizedPhone
    },
    ...(normalizedEmail?[{email:normalizedEmail}]:[])
  ]
})
  if (exists) {
    throw new ApiError(409, "customer already registered!");
  }
  const {password}=req.body;

if(password?.trim().length<6){
  throw new ApiError(400,"Password length must be 6 character")
}
let uploadedFilePath=null;
if(req.file?.path){
uploadedFilePath=await uploadFileOnCloud(req.file.path)
if(!uploadedFilePath){
  throw new ApiError(400,"file uploaded failed!")
}
}
const tempPassword=crypto.randomBytes(6).toString("hex")
  // Create customer
  const customer = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password:tempPassword,
    phone:normalizedPhone,
    gender: gender.toLowerCase(),
    role: "customer",
    distributorId: distributor._id,
    profilePic:uploadedFilePath?.url||null,
    address: {
         city: city.trim(),
      state: state?.trim(),
      pincode: Number(pincode),
      country: "India",
    },
    isVerified: true
  });
const response=customer.toObject();
delete response.password;
delete response.refreshToken;
  return res.status(201).json(
    new ApiResponse(201, {customer:response,tempPassword}, "customer added successfully!")
  );
});
export {updateDistributor,getCustomersInsights,approvecustomer,getAllApprovedDistributors,
  getDistributorProducts,getDistributorProductById,getDistributorOrders,
  getCustomersDirectory
  ,getDistributorOrderById,OrderStatusChange,getDistributorscustomers,getcustomerById,getCompanyProfile,getDashboardReports,updateWholesalePricing,
  exportsProductsToExcel,uploadDistributorDocs,deleteDistributorDocument,verifyDistributorDocument,
getTopcustomers,addcustomer}