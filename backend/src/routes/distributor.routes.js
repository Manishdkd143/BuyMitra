import Router from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { isAdmin, isAdminOrDistributor } from "../middleware/role.middleware.js";

import {
  addRetailer,
  approveRetailer,
  deleteDistributorDocument,
  exportsProductsToExcel,
  getAllApprovedDistributors,
  getDistributorOrderById,
  getDistributorOrders,
  getDistributorProductById,
  getDistributorProducts,
  getCompanyProfile,
  getDistributorsRetailers,
  getDashboardReports,
  getRetailerById,
  getTopRetailers,
  OrderStatusChange,
  updateDistributor,
  updateWholesalePricing,
  uploadDistributorDocs,
  verifyDistributorDocument
} from "../controllers/distributor.controller.js";


import { updateProfilePic } from "../controllers/user.controller.js";
import { Upload } from "../middleware/multer.middleware.js";
import { bulkUploadProducts} from "../controllers/product.controller.js";

const router = Router();

console.log(" Distributor Router Loaded");

// All distributor routes protected by JWT
router.use(verifyJWT);

/* -----------------------------
   PROFILE
------------------------------ */
router.get("/companyprofile", isAdminOrDistributor, getCompanyProfile);

router.patch(
  "/changeprofile",
  Upload.single("profilePic"),
  updateProfilePic
);

router.patch("/update", isAdminOrDistributor, updateDistributor);

/* -----------------------------
   RETAILERS
------------------------------ */
router.get("/retailers", isAdminOrDistributor, getDistributorsRetailers);

router.post("/add-retailer", addRetailer);

router.get("/retailer/:retailerId", isAdminOrDistributor, getRetailerById);

router.put(
  "/retailers/approve/:retailerId",
  isAdminOrDistributor,
  approveRetailer
);

/* -----------------------------
   PRODUCTS
------------------------------ */
router.get("/products", isAdminOrDistributor, getDistributorProducts);

router.get(
  "/product/:productId",
  isAdminOrDistributor,
  getDistributorProductById
);

router.put(
  "/products/wholePrice",
  isAdminOrDistributor,
  updateWholesalePricing
);

//inventory related routes are moved to inventory.routes.js
// router.get("/inventory/low-stock", isAdminOrDistributor, lowStockProducts)
/* -----------------------------
   ORDERS
------------------------------ */
router.get("/orders", isAdminOrDistributor, getDistributorOrders);

router.get("/order/:id", isAdminOrDistributor, getDistributorOrderById);

router.put("/order/status/:id", isAdminOrDistributor, OrderStatusChange);

/* -----------------------------
   INVENTORY REPORT
------------------------------ */
// router.get("/report", isAdminOrDistributor, getDistributorDashboard);

router.get("/top-retailers", getTopRetailers);

/* -----------------------------
   EXPORT PRODUCTS TO EXCEL
------------------------------ */
router.get(
  "/products/export/excel",
  isAdminOrDistributor,
  exportsProductsToExcel
);

/* -----------------------------
   APPROVED DISTRIBUTORS
------------------------------ */
router.get("/approved", getAllApprovedDistributors);

/* -----------------------------
   DOCUMENTS SECTION (FIXED)
------------------------------ */
router.put(
  "/documents",
  Upload.array("documents", 10),
  uploadDistributorDocs
);

router.delete("/documents/:docId", deleteDistributorDocument);

router.patch(
  "/documents/verify/:docId",
  isAdmin,
  verifyDistributorDocument
);
router.post(
  "/bulkupload",
  Upload.single("file"),
  isAdminOrDistributor,
  bulkUploadProducts
);

router.get("/reports", isAdminOrDistributor, getDashboardReports);
console.log(" Distributor Routes Ready");

export default router;
