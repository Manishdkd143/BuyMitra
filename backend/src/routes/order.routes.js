import Router from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { createOrderFromCart,
  getOrderById,
  getMyOrders,
  getDistributorOrders,
  updateOrderStatus,
  cancelOrder,
  getPendingOrders,
  getDeliveredOrders,
  getCancelledOrders, } from "../controllers/order.controller.js";
import { isAdmin, isAdminOrDistributor } from "../middleware/role.middleware.js";
const router=Router();
router.use(verifyJWT);
router.route("/o/").get(isAdminOrDistributor,getDistributorOrders);
router.post("/create-order",createOrderFromCart);
router.get("/o/pending",isAdminOrDistributor,getPendingOrders)
router.get("/o/completed",isAdminOrDistributor,getDeliveredOrders)
router.get("/o/cancelled",isAdminOrDistributor,getCancelledOrders)


router.get("/o/:orderId",getOrderById)
router.get("/myorders",getMyOrders);
// router.get("/order-number/:orderNumber",getOrderByOrderNumber);
router.patch("/:orderId/cancel",cancelOrder);
// DISTRIBUTOR ROUTES
router.route("/:orderId/status").patch(isAdminOrDistributor,updateOrderStatus);
// router.route("/distributor/stats").get(getOrderStats);
//admin routes
// router.route("admin/all-orders").get(isAdmin,getAllOrders);
// router.route("/admin/stats").get(isAdmin,getOrderStats)
export default router;