import Router from "express";
import verifyJWT from "../middleware/auth.middleware.js";

import { createPaymentOrder, getAllPayments, getOrderPaymentStatus, getPaymentDetails, verifyPayment } from "../controllers/payment.controller.js";
import { cashfreeWebHook } from "../controllers/webhook.controller.js";
import { isAdminOrDistributor } from "../middleware/role.middleware.js";
const router=Router();
router.use(verifyJWT);
router.post("/create-order",createPaymentOrder);
router.post("/webhook/cashfree",cashfreeWebHook);
router.post("/verify-payment/:orderId",verifyPayment)
router.get('/:paymentId', getPaymentDetails);
router.get("/order/:orderNumber",getOrderPaymentStatus);
router.get("/distributor/my-payments",isAdminOrDistributor,getAllPayments)

export default router;