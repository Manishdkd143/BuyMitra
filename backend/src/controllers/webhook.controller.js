import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto from "crypto"
const cashfreeWebHook = asyncHandler(async (req, res) => {
  try {
    const { orderId, orderAmount, referenceId, txStatus, paymentMode, signature } = req.body;

    // Validate required fields
    if (!orderId || !orderAmount || !referenceId || !txStatus || !signature) {
      return res.status(400).send("Missing required fields");
    }

    // Validate txStatus
    const validStatuses = ["SUCCESS", "FAILED", "PENDING", "CANCELLED"];
    if (!validStatuses.includes(txStatus)) {
      return res.status(400).send("Invalid transaction status");
    }

    // Generate and verify signature
    const data = orderId + orderAmount + referenceId + txStatus;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
      .update(data)
      .digest("base64");

    if (generatedSignature !== signature) {
      console.error("Signature mismatch:", { expected: generatedSignature, received: signature });
      return res.status(403).send("Invalid signature");
    }

    // Check if payment already exists
    let payment = await Payment.findOne({ paymentId: referenceId });
    
    if (!payment) {
      // Create new payment record
      payment = await Payment.create({
        orderId,
        paymentId: referenceId,
        amount: orderAmount,
        paymentMode,
        status: txStatus === "SUCCESS" ? "success" : "failed",
        signature: generatedSignature,
      });
    } else {
      // Update existing payment if status changed
      if (payment.status !== (txStatus === "SUCCESS" ? "success" : "failed")) {
        payment.status = txStatus === "SUCCESS" ? "success" : "failed";
        payment.paymentMode = paymentMode;
        await payment.save();
      }
    }

    // Update order with payment information
    const orderStatus = txStatus === "SUCCESS" ? "paid" : "unpaid";
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber: orderId },
      { paymentStatus: orderStatus, paymentInfo: payment._id },
      { new: true }
    );

    if (!updatedOrder) {
      console.error("Order not found:", orderId);
      return res.status(404).send("Order not found");
    }

    res.status(200).send("OK");

  } catch (error) {
    console.error("Webhook Error:", error.message); // Fixed typo: messsage -> message
    res.status(500).send("Webhook processing failed");
  }
});

export {cashfreeWebHook}