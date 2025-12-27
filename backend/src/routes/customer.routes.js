import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware";
import { isAdminOrDistributor } from "../middleware/role.middleware";
import {
  addcustomer,
  getCustomerActivity,
  getCustomerById,
  getCustomerLedger,
  getCustomerOrders,
  getCustomerOverview,
  getCustomersDirectory,
  getCustomersInsights,
  getTopcustomers,
} from "../controllers/customer.controller";

const router = Router();
router.use(verifyJWT);
router.post("/", isAdminOrDistributor, addcustomer);

router.get("/", isAdminOrDistributor, getCustomersDirectory);
router.get("/c/:customerId", isAdminOrDistributor, getCustomerById);
router.get("/insights", isAdminOrDistributor, getCustomersInsights);
router.get("/insights/top", isAdminOrDistributor, getTopcustomers);
router.get("c/:customerId/overview", isAdminOrDistributor, getCustomerOverview);
router.get("c/:customerId/orders", isAdminOrDistributor, getCustomerOrders);
router.get("c/:customerId/activity", isAdminOrDistributor, getCustomerActivity);
router.get("c/:customerId/ledger", isAdminOrDistributor, getCustomerLedger);
export default router;
