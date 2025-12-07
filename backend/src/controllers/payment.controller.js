import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyPayment=asyncHandler(async(req,res)=>{
      const { orderNumber, paymentId, amount, status, paymentMode, signature } = req.body;
      const payment=await Payment.create({
        orderId:orderNumber,
        paymentId,
        amount,
        paymentMode,
        status:status==="SUCCESS"?"success":"failed",
    signature,
      })
      if(!payment){
        throw new ApiError(404,"payment not created!")
      }
      const orderStatus=status==="SUCCESS"?"paid":"unpaid";
      const order= await Order.findOneAndUpdate({orderNumber},{paymentStatus:orderStatus,paymentInfo:payment._id},{new:true});
      if(!order){
        throw new ApiError(404,"order updated failed!")
      }
      res.status(200).json(new ApiResponse(200,{order,payment},"Payment verified"))
})
export {verifyPayment}