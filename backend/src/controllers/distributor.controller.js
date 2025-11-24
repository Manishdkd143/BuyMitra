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
const updateDistributor = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }
  
  if (isLoggedUser.role?.toLowerCase() === "retailer") {
    throw new ApiError(403, "Access denied! Retailer not allowed");
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
    updateFields.city = city.trim().replace(/\s+/g, '');
  }
  
  // State
  if (state !== undefined) {
    if (!state?.trim()) {
      throw new ApiError(400, "State cannot be empty!");
    }
    updateFields.state = state.trim().replace(/\s+/g, '');
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
    updateFields.pincode = pincodeStr;
  }
  
  // Check if at least one field is provided
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "At least one field is required to update!");
  }
  
  // Update distributor
  const updatedDistributor = await DistributorProfile.findOneAndUpdate(
    {userId:isLoggedUser._id}, 
    { $set: updateFields },
    { new: true, runValidators: true }
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
const getDistributorProducts=asyncHandler(async(req,res)=>{
  const isLoggedUser=req.user;
  const {page=1,limit=10}=req.query;
  let skip=(Number(page)-1)*Number(limit)
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(isLoggedUser.role.toLowerCase()==="retailer"){
    throw new ApiError(403,"Access-denied not allowed retailer!")
  }
  const total=await Product.countDocuments({createdBy:isLoggedUser._id})

const allProducts=  await Product.find({
  createdBy:isLoggedUser._id
},
{
  name:1,
  price:1,
  wholesalePrice:1,
  stock:1,
  thumbnail:1,
  brand:1,
  status:1,
  sku:1,
  category:1,
}).sort({createdAt:-1}).skip(skip).limit(limit)
if(!allProducts){
  throw new ApiError(404,"Product not found!")
}
return res.status(200).json(new ApiResponse(200,{
   currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProducts: total,
      allProducts,
}))

})
const getDistributorProductById = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { productId } = req.params;
  
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }
  
  if (isLoggedUser.role.toLowerCase() === "retailer") {
    throw new ApiError(403, "Access denied - not allowed for retailer!");
  }
  
  // SARI FIELDS with full details
  const product = await Product.findOne({
    _id: productId,
    createdBy: isLoggedUser._id
  })
    .populate('brand', 'name logo')
    .populate('category', 'name')
    .populate('createdBy', 'name email');
  
  if (!product) {
    throw new ApiError(404, "Product not found!");
  }
  
  return res.status(200).json(
    new ApiResponse(200, { product })
  );
});
//Order managenents--
const getDistributorOrders=asyncHandler(async(req,res)=>{
    const isLoggedUser=req.user;
    if(!isLoggedUser){
      throw new ApiError(401,"Unauthorized user!please login")
    }
    const {
      page=1,
      limit=10,
      status,
      startDate,
      endDate,
      search,
    }=req.body;
    const skip=(Number(page)-1)*Number(limit);
    if(isLoggedUser.role.toLowerCase()!=="distributor"){
      throw new ApiError(403,"Access-denied only for distributor!")
    }
    const filter={distributorId:isLoggedUser._id}
    if(startDate||endDate){
      filter.createdAt={};
      if(startDate){
        filter.createdAt.$gte=new Date(startDate)
      }
      if(endDate){
        filter.createdAt.$lte=new Date(endDate)
      }
    }
    if(status){
      filter.status=status.toLowerCase();
    }
    if(search){
     const matchingUsers=await User.find({
      role:"retailer",
      $or:[
        {
          name:{$regex:search,options:"i"}
        },
        {
          email:{$regex:search,options:"i"}
        },
        {
          phone:{$regex:search,options:"i"}
        }
      ]
     }).select("_id")
     const userIds=matchingUsers.map(u=>u._id)
     filter.$or=[
      {
        orderNumber:{$regex:search,options:"i"}
      },
      {userId:{$in:userIds}}
     ]
    }

const total=await Order.countDocuments(filter)
if(!total){
  throw new ApiError(404,"Order not found!")
}
const orders=await Order.find(filter).select(  'orderNumber ' +
      'userId ' +
      'products ' +
      'totalAmount ' +
      'status ' +
      'paymentStatus ' +
      'paymentMethod ' +
      'shippingAddress ' +
      'orderNotes ' +
      'trackingNumber ' +
      'createdAt ' +
      'deliveredAt').populate("userId","name email phone address").
      populate("products.productId","name thumbnail sku wholesalePrice").
      sort({createdAt:-1}).skip(skip).limit(Number(limit))
  const stats=  await Order.aggregate([
      {
        $match:{
          distributorId:isLoggedUser._id
        }
      },
      {
        $group:{
          _id:"$status",
          count:{$sum:1},
          totalRevenue:{$sum:'$totalAmount'}
        }
      }
    ])
     return res.status(200).json(
    new ApiResponse(200, {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalOrders: total,
      orders,
      stats,
    }, "Orders fetched successfully")
  );
})
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
//Retailer Management
const getDistributorsRetailers = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { page=1, limit = 10, search='' } = req.body;
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
    role: "retailer",
  };

  // 4. Search filter
  if (search) {
    baseQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  // 5. Count total retailers
  const totalRetailers = await User.countDocuments(baseQuery);

  if (!totalRetailers) {
    throw new ApiError(404, "Retailers not found!");
  }

  // 6. Fetch retailer list
  const retailers = await User.find(
    baseQuery,
    { name: 1, email: 1, phone: 1 }
  )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // 7. Response
  return res.status(200).json(
    new ApiResponse(200, {
      total: totalRetailers,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalRetailers / limit),
      retailers,
    }, "Retailers fetched successfully")
  );
});

const getRetailerById = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { retailerId } = req.params;

  // 1. Not logged in
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  // 2. Only Distributor can access retailer
  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access-denied! Only distributors allowed");
  }

  // 3. Validate retailerId
  if (!retailerId) {
    throw new ApiError(400, "Retailer ID is required");
  }

  // 4. Fetch retailer (must belong to distributor)
  const retailer = await User.findOne(
    {
      _id: retailerId,
      role: "retailer",
      distributorId: isLoggedUser._id, // Only their own retailer
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
  if (!retailer) {
    throw new ApiError(404, "Retailer not found or not linked to this distributor");
  }

  // 6. Send response
  return res.status(200).json(
    new ApiResponse(200, retailer, "Retailer fetched successfully")
  );
});

const approveRetailer = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { retailerId } = req.params;

  // 1. Authentication check
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  // 2. Only distributors can approve retailers
  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access denied! Only distributors can approve retailers.");
  }

  // 3. Retailer ID validation
  if (!retailerId) {
    throw new ApiError(400, "Retailer ID is required");
  }

  // 4. Find the retailer (must belong to this distributor)
  const retailer = await User.findOne({
    _id: retailerId,
    role: "retailer",
    distributorId: isLoggedUser._id,
  });

  if (!retailer) {
    throw new ApiError(
      404,
      "Retailer not found or not associated with this distributor"
    );
  }

  // 5. Already approved?
  if (retailer.status === "approved") {
    throw new ApiError(400, "Retailer is already approved");
  }

  // 6. Update status
  retailer.status = "approved";
  await retailer.save();

  // 7. Success response
  return res.status(200).json(
    new ApiResponse(200, retailer, "Retailer approved successfully")
  );
});

// const getRetailerOrders=as(async(req,res)=>{

// })

//Profiles
const getDistributorProfile=asyncHandler(async(req,res)=>{
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

const getInventoryReports=asyncHandler(async(req,res)=>{
   const isLoggedUser = req.user;
  const { page = 1, limit = 10, search = "" } = req.body;
  const pageNumber = Number(page);
  const skip = (pageNumber - 1) * Number(limit);

  // Authorization checks
  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (isLoggedUser.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access denied - only allowed for distributors!");
  }
 const distributorId=isLoggedUser._id
  // Base filter for distributor
  const filter = { distributorId:distributorId };
  if(search){
    const productIds=await getProductIdsForSearch(search,distributorId);
    if(productIds.length){
      filter.productId={$in:productIds}
    }else{
      res.status(200).json(new ApiResponse(200,{ total: 0,
          lowStockProducts: [],
          categorySummary: [],
          inventoryList: [],}))
    }
  }
  const [total,lowStockProducts,categorySummary,inventoryList]=
  await Promise.all([
     Inventory.countDocuments(filter),
     getLowStockProductsByCategory(distributorId),
     getCategorySummary(distributorId),
     Inventory.find(filter).populate("productId","name price stock brand category").
     sort({createdAt:-1}).skip(skip).limit(limit)
  ])


   return res.status(200).json(
    new ApiResponse(200, {
      total,
      page: pageNumber,
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      lowStockProducts,
      categorySummary,
      inventoryList,
    },"Inventory fetched successfully")
  );


  async function getProductIdsForSearch(search,distributorId){
    const products=await Product.find({$or:[
      {
        name:{$regex:search,$options:"i"},
      },
      {
        brand:{$regex:search,$options:"i"}
      }
    ],
    createdBy:distributorId
  }).select("_id")
    const productIds=products.map(p=>p._id)
    const categories=await Category.find({name:{$regex:search,$options:"i"}}).select("_id");
     const categoryIds=categories.map(c=>c._id);
     if(categoryIds.length>0){
      const categoryProducts=await Product.find({category:{$in:categoryIds},createdBy:distributorId}).select("_id")
       const cpIds=categoryProducts.map((cp)=>cp._id);
       productIds=[...new Set([...productIds,...cpIds])]
     }
     return productIds;
  }
  async function getLowStockProductsByCategory(distributorId){
    return await Inventory.aggregate([
      {
        $match:{
          distributorId:distributorId,
          quantity:{$lte:10}
        }
      },
      {
        $group:{
          _id:"$productId",
          totalStock:{$sum:"$quantity"}
        }
      },
      {
        $match:{
          totalStock:{$lte:10}
        }
      },
      {
        $lookup:{
          from:"products",
          localField:"_id",
          foreignField:"_id",
          as:"product",
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
          _id:"$product.category",
          catName:{$first:"$category.name"},
          totalLowStockProducts:{$addToSet:"$_id"},
          lowStockProducts:{
            $push:{
              productId:"$_id",
              productName:"$product.name",
              totalStock:"$totalStock",
              brand:"$product.brand",
            }
          }
        }
      },
      {
        $project:{
          _id:0,
          categoryId:"$_id",
          catName:1,
          totalLowStockProducts:{$size:"$totalLowStockProducts"},
          lowStockProducts:1
        }
      },
      {
        $sort:{totalLowStockProducts:-1}
      }
    ])
  }
  async function getCategorySummary(distributorId) {
         await Inventory.aggregate([
          {
            $match:{
              distributorId:distributorId
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
              products:{$addToSet:"$product._id"},
              totalStock:{$sum:"$quantity"}
            }
          },
          {
            $project:{
              _id:0,
              categoryId:"$_id",
              categoryName:1,
              totalProducts:{$size:"$products"},
              totalStock:1,

            }
          },
          {
       $sort:{totalStock:-1},
          }
         ]) 
  }
})

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
// retailer.controller.js
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


export {updateDistributor,approveRetailer,getAllApprovedDistributors,uploadDistributorDocs,getDistributorProducts,getDistributorProductById,getDistributorOrders,getDistributorOrderById,OrderStatusChange,getDistributorsRetailers,getRetailerById,getDistributorProfile,getInventoryReports,updateWholesalePricing,exportsProductsToExcel}