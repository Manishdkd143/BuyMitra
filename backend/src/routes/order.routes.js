import Router from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { cancelOrder, createOrderFromCart, getAllOrders, getDistributorOrders, getMyOrders, getOrderById, getOrderByOrderNumber, getOrderStats, updateOrderStatus } from "../controllers/order.controller.js";
import { isAdmin, isAdminOrDistributor } from "../middleware/role.middleware.js";
const router=Router();
router.use(verifyJWT);
router.post("/create-order",createOrderFromCart);
router.get("/o/:orderId",getOrderById)
router.get("/myorders",getMyOrders);
router.get("/order-number/:orderNumber",getOrderByOrderNumber);
router.patch("/:orderId/cancel",cancelOrder);
// DISTRIBUTOR ROUTES
router.route("distributor/orders").get(isAdminOrDistributor,getDistributorOrders);
router.route("/:orderId/status").patch(isAdminOrDistributor,updateOrderStatus);
router.route("/distributor/stats").get(getOrderStats);
//admin routes
router.route("admin/all-orders").get(isAdmin,getAllOrders);
router.route("/admin/stats").get(isAdmin,getOrderStats)
export default router;