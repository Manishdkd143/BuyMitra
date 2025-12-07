import Router from "express";
import verifyJWT from "../middleware/auth.middleware";
import { createOrder } from "../controllers/order.controller";
import { verifyPayment } from "../controllers/payment.controller";
const router=Router();
router.use(verifyJWT);
router.route("/create-order",createOrder);
router.route("/verify-payment",verifyPayment)
export default router;