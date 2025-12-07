import Router from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { isAdminOrDistributor } from "../middleware/role.middleware.js";

import {
  approveRetailer,
  exportsProductsToExcel,
  getAllApprovedDistributors,
  getDistributorOrderById,
  getDistributorOrders,
  getDistributorProductById,
  getDistributorProducts,
  getDistributorProfile,
  getDistributorsRetailers,
  getInventoryReports,
  getRetailerById,
  OrderStatusChange,
  updateDistributor,
  updateWholesalePricing
} from "../controllers/distributor.controller.js";
import { getAllApprovedDistributor } from "../controllers/admin.controller.js";

const router = Router();

// All distributor routes protected by JWT
router.use(verifyJWT);

/* -----------------------------
   PROFILE
------------------------------ */
router
  .route("/profile")
  .get(isAdminOrDistributor, getDistributorProfile);

router
  .route("/update")
  .patch(isAdminOrDistributor, updateDistributor);

/* -----------------------------
   RETAILERS
------------------------------ */
router
  .route("/retailers")
  .get(isAdminOrDistributor, getDistributorsRetailers);

router
  .route("/retailer/:retailerId")
  .get(isAdminOrDistributor, getRetailerById);

router
  .route("/retailers/approve/:retailerId")
  .put(isAdminOrDistributor, approveRetailer);

/* -----------------------------
   PRODUCTS
------------------------------ */
router
  .route("/products")
  .get(isAdminOrDistributor, getDistributorProducts);

router
  .route("/products/:productId")
  .get(isAdminOrDistributor, getDistributorProductById);

router
  .route("/products/wholePrice")
  .put(isAdminOrDistributor, updateWholesalePricing);

/* -----------------------------
   ORDERS
------------------------------ */
router
  .route("/orders")
  .get(isAdminOrDistributor, getDistributorOrders);

router
  .route("/orders/:id")
  .get(isAdminOrDistributor, getDistributorOrderById);

router
  .route("/orders/status/:id")
  .put(isAdminOrDistributor, OrderStatusChange);

/* -----------------------------
   INVENTORY REPORT
------------------------------ */
router
  .route("/inventory/report")
  .get(isAdminOrDistributor, getInventoryReports);

/* -----------------------------
   EXPORT PRODUCTS TO EXCEL
------------------------------ */
router
  .route("/products/export/excel")
  .get(isAdminOrDistributor, exportsProductsToExcel);

  router.route("/approved").get(getAllApprovedDistributors)

export default router;
