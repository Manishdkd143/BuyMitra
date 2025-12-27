import mongoose from "mongoose";
import { Order } from "../models/order.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import crypto from "crypto"
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { CustomerLedger } from "../models/customerLedger";
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
const getCustomerById = asyncHandler(async (req, res) => {
  const user = req.user;
  const  customerId  = req.params.customerId;

  if (!user) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (user.role.toLowerCase() !== "distributor") {
    throw new ApiError(403, "Access-denied! Only distributors allowed");
  }

  if (!customerId) {
    throw new ApiError(400, "customer ID is required");
  }

  const customer=await User.findOne({
    _id:new mongoose.Types.ObjectId(customerId),
    role:'customer',
    distributorId:user._id,
  }).select(
    {
     name: 1,
    email: 1,
    phone: 1,
    status: 1,
    createdAt: 1,
    address: 1,
    }
  )

if(!customer){
  return res.status(200).json(new ApiResponse(200,{},"Customer not found"))
}
const statsAgg=await Order.aggregate([
  {
    $match:{
      userId:new mongoose.Types.ObjectId(customerId),
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
            {
              $in:["$paymentStatus",["unpaid","partially_paid"]]
            },
            "$totalAmount",
            0,
          ]
        }
      },
      lastOrderDate:{$max:"$createdAt"}
    }
  },
])
  const stats = statsAgg[0] || {
      totalOrders: 0,
      totalSpent: 0,
      outstanding: 0,
      lastOrderDate: null,
    };


  return res.status(200).json(
    new ApiResponse(200, {customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        status: customer.status,
        joinedAt: customer.createdAt,
        address:customer.address,
      },
      summary: {
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        outstanding: stats.outstanding,
        lastOrderDate: stats.lastOrderDate,
      }}
      , "customer fetched successfully")
  );
});
const getCustomerOverview=asyncHandler(async(req,res)=>{
  const user=req.user;
  const customerId=req.params.customerId;

  if(!user||user.role!=="distributor"){
     throw new ApiError(401,"Unauthorized user!")
  }
  if(!mongoose.isValidObjectId(customerId)){
     throw new ApiError(401,"Invalid customer id!")
  }
     const customerDetails=await getCustomerById(customerId);
     const overview=await Order.aggregate([
      {
        $match:{
          distributorId:user._id,
          userId:new mongoose.Types.ObjectId(customerId),
          status:{$ne:"cancelled"},
        }
      },
      {
         $group:{
          _id:null,
          totalOrders:{$sum:1},
          totalSpent:{$sum:"$totalAmount"},
          outStanding:{
            $sum:{
              $cond:[
                {
                  $in:["$paymentStatus",["unpaid","partially_paid"]]
                },
                "$totalAmount",
                0
              ]
            }
          },
          totalPaid:{
            $sum:{
            $cond:[
              {
                $eq:["$paymentStatus","paid"]
              },
              "$totalAmount",
              0
            ]}
          },
          lastOrderDate:{$max:"$createdAt"}
         }
      },
{
  $project:{
    _id:0,
    totalOrders:1,
    totalSpent:1,
    totalPaid:{
    $add:"$totalPaid"
    },
    balanceDue:{
    $subtract:
     [ "$totalSpent",
      "$totalPaid"]
    },
    lastOrderDate:{
      $dateToString:{
        format:"%y-%m-%d",
        date:"$lastOrderDate"
      }
    }
  }
}
     ])
     const summary=overview[0]||{ totalOrders: 0,
      totalSpent: 0,
      totalPaid: 0,
      balanceDue: 0,
      lastOrderDate: null}
      return res.status(200).json(new ApiResponse({customer,summary},"Customer overview fetched successfully"))
})
const getCustomerOrders=asyncHandler(async(req,res)=>{
   const user=req.user;
  const customerId=req.params.customerId;
  if(!user||user.role!=="distributor"){
     throw new ApiError(401,"Unauthorized user!")
  }
  if(!mongoose.isValidObjectId(customerId)){
     throw new ApiError(401,"Invalid customer id!")
  }

  const summary = await Order.aggregate([
    {
      $match: {
        distributorId: user._id,
        userId: new mongoose.Types.ObjectId(customerId),
        status: { $ne: "cancelled" },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 0,

        orderId: "$_id",          
        orderNumber: "$orderNumber",   
        orderDate: {
          $dateToString: {
            format: "%d %b %Y",
            date: "$createdAt",
          },
        },

        status: 1,

        itemsCount: { $size: "$products" },
        totalAmount: 1,
        paidAmount: {
          $cond: [
            { $eq: ["$paymentStatus", "paid"] },
            "$totalAmount",
            { $ifNull: ["$paidAmount", 0] }
          ],
        },
        dueAmount: {
          $subtract: [
            "$totalAmount",
            { $ifNull: ["$paidAmount", 0] },
          ],
        },
      },
    },
  ]);
  const orders=summary[0]||{
     totalOrders: 0,
      totalSpent: 0,
      totalItems: 0,
      totalPaid: 0,
      due: 0,
  }
  return res.status(200).json(new ApiResponse(200,orders,"Customer orders fetched successfully"))
})
const getCustomerActivity=asyncHandler(async(req,res)=>{
  const user=req.user;
  const customerId=req.params.customerId;
  if(!user||user.role!=="distributor"){
    throw new ApiError(401,"Unauthorized user!")
  }
  if(!mongoose.isValidObjectId(customerId)){
    throw new ApiError(400,"Invalid customer id!")
  }
 const order= await Order.find({
    role:"customer",
    distributorId:user._id,
    status:{$ne:"cancelled"}
  }).select("orderNumber totalAmount status paymentStatus createdAt orderNumber totalAmount status paymentStatus createdAt deliveredAt")
  const orderActivities=order.flatMap(order=>{
    let activities=[];
    //order placed
    activities.push({
      id:order._id,
      type:"order",
      action:"order_placed",
      title:"Order Placed",
      amount:order.totalAmount,
      orderNumber:order.orderNumber,
      status:"success",
       createdAt:order.createdAt
    })
    //order Completed
    if(order.status==="delivered"){
      activities.push({
        id:order._id,
        type:"order",
        action:"order_completed",
        title:"Order Completed",
        amount:order.totalAmount,
        orderNumber:order.orderNumber,
        status:"success",
        deliveredAt:order.deliveredAt||order.createdAt
      })
    }
    //payment Received
    if(order.paymentStatus==="paid"){
      activities.push({
        id:order._id,
        type:"payment",
        action:"payment_received",
        title:"Payment Received",
        amount:order.totalAmount,
        status:"success",
        createdAt:order.deliveredAt||order.createdAt
      })
    }
    if (order.paymentStatus === "unpaid") {
  activities.push({
    id: order._id,
    type: "payment",
    action: "payment_unpaid",
    orderNumber: order.orderNumber,
    status: "pending",
    createdAt: order.createdAt
  });
}
    if(order.paymentStatus==="partially_paid"){
      activities.push({
        id:order._id,
        type:"payment",
        action:"payment_partial",
        title:"Partial Payment Recieved",
        status:"success",
        createdAt:order.createdAt
      })
    }
    return activities
  })
  const customer=await User.findById(customerId).select("status createdAt");
  const accountActivities=[];
  if(customer?.status==="suspended"){
    accountActivities.push({
      id:customerId,
       type:"block",
       action:"customer_blocked",
       title:"Customer Temporarily Blocked",
       status:"warning",
       createdAt:customer.updatedAt
    })
  }
  const activities=[...orderActivities,...accountActivities].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
  return res.status(200).json(new ApiResponse(200,activities,"customer activities fetched successfully"))
})
const getCustomerLedger=asyncHandler(async(req,res)=>{
  const distributorId=req.user._id;
  const customerId=req.paramas.customerId;
  if(!distributorId){
    throw new ApiError(401,"Unauthorized user!")
  }
  if(!mongoose.isValidObjectId(customerId)){
    throw new ApiError(400,"Invalid customer Id!")
  }
  const ledgerEntries=await CustomerLedger.findOne({
    distributorId,
    customerId
  }).sort({createdAt:-1})
  const currentBalance=ledgerEntries.length>0?ledgerEntries[0].balanceAfter:0;
  const ledger=ledgerEntries.map(entry=>({
    id:entry._id,
    type:entry.type,
    description:entry.description,
    amount:entry.entry,
    balance:entry.balance,
    date:entry.createdAt,
    orderNumber:entry.orderNumber||null,
    paymentMethod:entry.paymentMethod||null,
  }))
  return res.status(200).json(new ApiResponse(200,{currentBalance,ledger},"Customer ledger fetched successfully"))
})
export {getTopcustomers,addcustomer,
  getCustomersDirectory,getCustomerById,getCustomersInsights,getCustomerOverview,getCustomerOrders,getCustomerActivity,getCustomerLedger}