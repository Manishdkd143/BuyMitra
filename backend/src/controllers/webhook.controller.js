import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const cashfreeWebHook=asyncHandler(async(req,res)=>{
   try {
    const { orderId, orderAmount, referenceId, txStatus, paymentMode, signature } = req.body;

    const payment = await Payment.create({
      orderId,
      paymentId: referenceId,
      amount: orderAmount,
      paymentMode,
      status: txStatus === "SUCCESS" ? "success" : "failed",
      signature,
    });

    const orderStatus = txStatus === "SUCCESS" ? "paid" : "unpaid";
    await Order.findOneAndUpdate(
      { orderNumber: orderId },
      { paymentStatus: orderStatus, paymentInfo: payment._id }
    );

    res.status(200).send("OK");

  } catch (error) {
    console.error("Webhook Error:", error.message);
  throw new ApiError(500,error?.message||"transcation error")
  }
})
export {cashfreeWebHook}