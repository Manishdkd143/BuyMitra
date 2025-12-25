import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Cart } from "../models/cart.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Address } from "../models/address.model.js";
import { User } from "../models/user.model.js";
import { DistributorProfile } from "../models/distributorProfile.model.js";

const addToCart = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { productId, quantity, price,sku,distributorId } = req.body;

  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }
if(["admin","distributor"].includes(isLoggedUser.role.toLowerCase())){
  throw new ApiError(401,"Only customer buying product!")
}
  if (!productId || !isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid or missing product ID");
  }

  if (!quantity || quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  if (!price || price < 0) {
    throw new ApiError(400, "Price must be a positive number");
  }
   if(!sku){
    throw new ApiError(400,"Sku is required!")
   }
   if (!distributorId || !isValidObjectId(distributorId)) {
    throw new ApiError(400, "DistributorId is required!")
  }

  let cart = await Cart.findOne({ userId: isLoggedUser._id });

  if (cart) {
    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].qty += Number(quantity);
    } else {
      cart.items.push({ productId, qty: quantity, price,sku:sku?.trim()?.toUpperCase() });
    }
      cart.distributorId = distributorId;
    await cart.save(); 
    return res.status(200).json(new ApiResponse(200, cart, "Cart updated successfully"));
  }

  // Create new cart
  const newCart = await Cart.create({
    userId: isLoggedUser._id,
    distributorId,
    items: [{ productId, qty: quantity, price,sku:sku?.trim()?.toUpperCase()}]
  });

  if (!newCart) {
    throw new ApiError(500, "Failed to create cart");
  }

  return res.status(201).json(new ApiResponse(201, newCart, "Cart created successfully"));
});
const removeToCart=asyncHandler(async(req,res)=>{
 const isLoggedUser = req.user;
  const { productId } = req.params;

  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid or missing product ID");
  }

  const cart = await Cart.findOne({ userId: isLoggedUser._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found or does not belong to you");
  }
let  intialLength=cart.items.length;
 cart.items=cart.items.filter(item=>item.productId.toString()!==productId.toString())
 if(cart.items.length===intialLength){
  throw new ApiError(404,"Item not found in cart")
 }
 await cart.save();
return res.status(200).json(new ApiResponse(200,cart,"Item removed from cart successfully"))
})
const deleteCart=asyncHandler(async(req,res)=>{
  const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  const {cartId}=req.params;
  if(!cartId&&!mongoose.isValidObjectId(cartId)){
    throw new ApiError(404,"cart id required!")
  }
  const cart=await Cart.findOneAndDelete({_id:cartId,userId:isLoggedUser._id})
  if(!cart){
    throw new ApiError(404,"cart not found!")
  }
  res.status(200).json(new ApiResponse(200,cart,"cart deleted successfully!"))
})
const updateCartItemQuantity=asyncHandler(async(req,res)=>{
const isLoggedUser=req.user;
const {productId}=req.params;
const {quantity}=req.body;

  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid or missing product ID");
  }

  if (quantity === undefined || isNaN(quantity)) {
    throw new ApiError(400, "Quantity must be a valid number");
  }


  const cart = await Cart.findOne({ userId: isLoggedUser._id });
  if (!cart) {
    throw new ApiError(404, "cart not found!");
  }

    const itemIndex = cart.items.findIndex(
        (item)=>item.productId.toString()===productId.toString()
    )
   
  if (itemIndex === -1) {
    throw new ApiError(404, "Product not found in cart!");
  }
    const newQty=Number(quantity)
    if(newQty<0){
      cart.items.splice(itemIndex,1)
    }else{
      cart.items[itemIndex].qty=newQty
    }
    await cart.save();
    return res.status(200).json(new ApiResponse(200,cart,"product quantity update successfully"))
})
const getUserCart=asyncHandler(async(req,res)=>{
const isLoggedUser=req.user;
if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
}
console.log(isLoggedUser._id);

const userCart=await Cart.findOne({userId:isLoggedUser._id});
if(!userCart){
    throw new ApiError(404,"user cart not found!")
}
return res.status(200).json(new ApiResponse(200,userCart,"User cart fetched successfully"))
})
const clearCart=asyncHandler(async(req,res)=>{
const isLoggedUser=req.user;
if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login")
}

  const freshcart = await Cart.findOne({ userId: isLoggedUser._id });
  if (!freshcart) {
    throw new ApiError(404, "Cart not found or does not belong to you!");
  }
if(!freshcart){
    throw new ApiError(404,"cart not found!")
}
freshcart.items=[];
await freshcart.save()
return res.status(200).json(new ApiResponse(200,freshcart,"Cart is cleared successfully"))
})
const getCartSummary=asyncHandler(async(req,res)=>{
     const isLoggedUser=req.user;
     if(!isLoggedUser){
        throw new ApiError(401,"Unauthorized user!please login")
     }
     const userId=isLoggedUser?._id;
     if(!mongoose.isValidObjectId(userId)){
      throw new ApiError(400,"Invalid user id!")
     }
     const {cartId}=req.query;
     if(!cartId&&!mongoose.isValidObjectId(cartId)){
      throw new ApiError(400,"cart id required!")
     }
    const cart= await Cart.findOne({_id:cartId,userId:userId})
  if(!cart){
    throw new ApiError(404,"cart not found!")
  }

  const aggCart=await Cart.aggregate([
    {
      $match:{
        _id:cart._id,
      }
    },
    {
     $lookup:{
      from:"products",
      localField:"items.productId",
      foreignField:"_id",
      as:"productDetails",
      pipeline:[
        {
          $project:{
            name:1,
            images:1,
            unit:1,
            price:1,
            stock:1,
          }
        }
      ]
     },
    },
    {
      $project:{
        __v:0,
        createdAt:0,
        updatedAt:0,
        lastUpdated:0,
        shippingCharge:0,
      }
    }
  ])



  // const aggCart=await Cart.aggregate([
  //   {
  //     $match:{
  //       userId:isLoggedUser._id
  //     }
  //   },
  //  {
  //   $facet:{
  //     totalItems:[
  //       {
  //         $unwind:"$items"
  //       },
  //       {
  //         $count:"items"
  //       }
  //     ],
  //     totalQty:[
  //       {
  //         $unwind:"$items"
  //       },
  //       {
  //         $group:{
  //           _id:"$items.productId",
  //           total:{$sum:"$items.qty"},
  //         },
  //       },
  //     ],
  //   }
  //  }
  // ])
//  const aggCart= await Cart.aggregate([
//     {
//         $match:{userId:isLoggedUser._id},
//     },
 
//   {
//     $facet:{
//     totalItems:[
//   {
//     $unwind:"$items"
//   },
//     {
//         $count:"count"
//     }
//     ],
//     totalQuantity:[
//         {
//             $unwind:"$items"
//         },
//        {
//         $group:{
//             _id:null,
//             totalQty:{$sum:"$items.quantity"}
//         }
//        },
      
//     ],
//     withSubtotal:[
//        {
//         $addFields:{
//             subtotal:{
//                 $sum:{
//                     $map:{
//                         input:"$items",
//                         as:"item",
//                         in:{
//                             $multiply:["$$item.price","$$item.quantity"]
//                         }
//                     }
//                 }
//             }
//         }
//        }
//     ],


//     }
   
//   }
//   ])
  if(!aggCart){
    throw new ApiError(404,"cart not found!")
  }
  return res.status(200).json(new ApiResponse(200,aggCart,"cart summary is fetched successfully"))
})
const bulkRemoveItems=asyncHandler(async(req,res)=>{
     const isLoggedUser=req.user;
if(!isLoggedUser){
    throw new ApiError(404,"Unauthorized user!please login")
}
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "At least one cart ID is required!");
  }

  const validIds = ids.filter((id) => isValidObjectId(id));
  if (validIds.length === 0) {
    throw new ApiError(400, "No valid cart IDs provided!");
  }
 const deletedResult = await Cart.findByIdAndUpdate({
    user:isLoggedUser._id,
 },
{
    $pull:{
        items:{
            productId:{
                $in:{validIds}
            }
        }
    }
},
{
    new:true,
})
return res.status(200).json(new ApiResponse(200,{deletedItems:deletedResult.deletedCount},"carts deleted successfully"))
})
const mergeGuestCartWithUserCart=asyncHandler(async(req,res)=>{
const isLoggedUser=req.user;
if(!isLoggedUser){
    throw new ApiError(401,"Unauthorized user!please login!")
}
const {guestCart}=req.body;
if (!guestCart || !Array.isArray(guestCart) || guestCart.length === 0) {
    throw new ApiError(400, "Guest cart is empty or invalid!");
  }
let userCart=await Cart.findOne({user:isLoggedUser._id})
if(!userCart){
    userCart=await Cart.create({user:isLoggedUser._id,items:[]})
}
guestCart.forEach((guestItem)=>{
     if(!isValidObjectId(guestItem.productId)){
        throw new ApiError(402,"Invalid product id!")
    }
    //if product existing then only increased quantiry
    const existingIndex=userCart.items.findIndex((item)=>
        item.productId.toString()==guestItem.productId.toString()
    )
    if(existingIndex>-1){
        userCart.items[existingIndex].quantity+=Number(guestItem.quantity||1)
    }else{
        userCart.items.push( { productId: guestItem.productId,
      quantity: guestItem.quantity || 1,
      price: guestItem.price,})
    }
   
})

userCart.totalPrice=userCart.items.reduce((sum,item)=>sum+item.price*item.quantity,0)
await userCart.save();
return res.status(200).json(new ApiResponse(200,userCart,"guest cart merge user cart successfully"))
}
)
const calculateShipping=asyncHandler(async(req,res)=>{
  const isLoggedUser=req.user;
  if(!isLoggedUser){
  throw new ApiError(401,"Unauthorized user!please login")
  }
  const {userId,addressId}=req.body;
  if(!userId||!addressId){
    throw new ApiError(403,"user or address id required!")
  }
  if(!mongoose.isValidObjectId(userId)){
    throw new ApiError(403,"Invalid user id!")
  }
  if(!mongoose.isValidObjectId(addressId)){
    throw new ApiError(403,"Invalid address id!")
  }
    const cart= await Cart.findOne({userId:userId})
  if(!cart){
    throw new ApiError(404,"cart not found!")
  }
    const itemsTotal=cart?.itemsTotal;
   if(isNaN(itemsTotal)&&itemsTotal===undefined){
    throw new ApiError(402,"Invalid items total!")
   }
   if(itemsTotal>=500){
    cart.shippingCharge=0;
    await cart.save()
    return res.status(200).json(new ApiResponse(200,{shippingCharge:0,isFreeShipping:true},"Congratulations!Free shipping applied"))
   }
      const address=await Address.findOne({
        _id:addressId,
        userId:isLoggedUser._id,
      })
      console.log(address);
      
  if(!address){
    throw new ApiError(404,"Address not found or unauthorized!")
  }
    // const fields={};
    // if(address.state&&address.state!=="") fields.state=address.state?.trim().toLowerCase();
    // if(!isNaN(address.pincode)&&address.pincode!==undefined)fields.pincode=address.pincode;
    //  if(!fields&&!fields.length){
    //   throw new ApiError(400,"state and pincode is missing!")
    //  }
  //  const aggCart=await Address.aggregate([
  //   {
  //     $match:{
  //       _id:address._id,
  //     }
  //   },
  //   {
  //     $lookup:{
  //       from:"users",
  //       localField:"userId",
  //       foreignField:"_id",
  //       as:"userDetails",
  //       pipeline:[
  //         {
  //           $project:{
  //             address:1,
  //             role:1,
  //           }
  //         }
  //       ]
  //     }
  //   }
  //  ])
console.log(address.state?.trim().toLowerCase());

const distributor=await DistributorProfile.findOne({
  "businessAddress.state":address.state?.trim()?.toLowerCase(),
 status:"approved",
})
if(!distributor){
  throw new ApiError(404,"No distributor found for your area!")
}
let shippingCharge=0;
const userPin=address.pincode;
const distPin=distributor?.businessAddress.pincode;
const pinDiff=Math.abs(userPin-distPin)
console.log(pinDiff);
if (!pinDiff && pinDiff !== 0) {
  throw new Error("pinDiff required");
}

if (pinDiff <= 50) shippingCharge = 30;
else if (pinDiff <= 80) shippingCharge = 40;
else if (pinDiff <= 100) shippingCharge = 50;
else shippingCharge = 100;
     cart.shippingCharge=shippingCharge;
     await cart.save()
     return res.status(200).json(
    new ApiResponse(200, {
      shippingCharge: shippingCharge,
      distributorName: distributor.businessName,
      isFreeShipping: false
    }, "Shipping calculated")
  );
})
const calculateTotal = asyncHandler(async (req, res) => {
  const isLoggedUser = req.user;
  const { cartId } = req.body;

  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user! Please login");
  }

  if (!cartId || !mongoose.isValidObjectId(cartId)) {
    throw new ApiError(400, "Cart ID is required and must be valid");
  }

  const cart = await Cart.findOne({ _id: cartId, userId: isLoggedUser._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found!");
  }

  // ---- Recalculate item totals ----
  let subtotal = 0;
  cart.items.forEach((item) => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    const itemTotal = qty * price;

    item.subTotal = itemTotal;
    subtotal += itemTotal;
  });

  // ---- Assign itemsTotal ----
  cart.itemsTotal = subtotal;

  // ---- Apply coupon discount ----
  const discountAmount = cart?.coupon?.discountAmount || 0;
  cart.discount = discountAmount;

  let afterDiscount = subtotal - discountAmount;

  // ---- Apply tax ----
  const taxRate = 0.12; // change if required
  cart.Tax = Math.round(afterDiscount * taxRate);

  let afterTax = afterDiscount + cart.Tax;

  // ---- Add shipping charge ----
  cart.shippingCharge = cart.shippingCharge || 0;

  // ---- Calculate grand total ----
  cart.grandTotal = Math.max(0, afterTax + cart.shippingCharge);

  cart.lastUpdated = new Date();
  await cart.save();

  return res.status(200).json(
    new ApiResponse(200, cart, "Cart totals calculated successfully!")
  );
});

export {addToCart,removeToCart,updateCartItemQuantity,getUserCart,deleteCart,clearCart,getCartSummary,calculateShipping,bulkRemoveItems,mergeGuestCartWithUserCart,calculateTotal}