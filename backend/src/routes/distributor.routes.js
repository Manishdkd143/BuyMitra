import Router from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { isAdminOrDistributor } from "../middleware/role.middleware.js";

import {
  approveRetailer,
  exportsProductsToExcel,
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
  .put(isAdminOrDistributor, updateDistributor);

/* -----------------------------
   RETAILERS
------------------------------ */
router
  .route("/retailers")
  .get(isAdminOrDistributor, getDistributorsRetailers);

router
  .route("/retailers/:id")
  .get(isAdminOrDistributor, getRetailerById);

router
  .route("/retailers/approve/:id")
  .put(isAdminOrDistributor, approveRetailer);

/* -----------------------------
   PRODUCTS
------------------------------ */
router
  .route("/products")
  .get(isAdminOrDistributor, getDistributorProducts);

router
  .route("/products/:id")
  .get(isAdminOrDistributor, getDistributorProductById);

router
  .route("/products/wholesale-pricing")
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

export default router;
