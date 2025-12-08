import Router from "express";
import verifyJWT from "../middleware/auth.middleware.js";

import { createPaymentOrder, getAllPayments, getOrderPaymentStatus, getPaymentDetails, verifyPayment } from "../controllers/payment.controller.js";
import { cashfreeWebHook } from "../controllers/webhook.controller.js";
const router=Router();
router.use(verifyJWT);
router.post("/create-order",createPaymentOrder);
router.post("/verify-payment",verifyPayment)
router.get('/:paymentId', getPaymentDetails);
router.get("/order/:orderNumber",getOrderPaymentStatus);
router.post("/cashfree",cashfreeWebHook);
router.post("/distributor/my-payments",getAllPayments)

export default router;