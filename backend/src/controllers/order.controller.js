import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
const CASHFREE_BASE_URL=  process.env.CASHFREE_ENV === "sandbox"
    ? "https://sandbox.cashfree.com/pg/orders"
    : "https://api.cashfree.com/pg/orders";
const checkOut=asyncHandler(async(req,res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError(401,"Unauthorized user!")
    }
    const {addressId,paymentMethod}=req.body;
    if(!addressId||!paymentMethod){
        throw new ApiError(404,"Address and payment is required!")
    }
    res.status(200).json(new ApiResponse(200,{addressId,paymentMethod},"checkout details recieved."))
})
const createOrder=asyncHandler(async(req,res)=>{
 const { distributorId, userId, products, shippingAddress, orderNotes, paymentMethod } = req.body;
 const order = await Order.create({
      distributorId,
      userId,
      products,
      shippingAddress,
      orderNotes,
      paymentMethod,
    });
    const response=await axios.post(CASHFREE_BASE_URL,{
        order_id:order.orderNumber,
        order_amount:order.totalAmount,
        order_currency:"INR",
        customer_details:{
            customer_name:shippingAddress.name,
            customer_email:req.body.customerEmail,
            customer_phone:shippingAddress.phone,
        },
    },
{
    headers:{
        "x-client-id":process.env.CASHFREE_APP_ID,
        "x-client-secret":process.env.CASHFREE_SECRET_KEY,
        "Content-Type":"application/json"
    }
})
if(!response.data||response.success==="false"){
    throw new ApiError(500,"cashfree fetched failed!")

}
 res.status(200).json(new ApiResponse(200,{data:response.data,order},"order created successfully"));
})
export {createOrder}