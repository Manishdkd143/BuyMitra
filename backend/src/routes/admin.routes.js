import { Router } from "express";
import { isAdmin } from "../middleware/role.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { 
  adminRegister,
  adminLogin,
  getAllUser,
  getUserById,
  changeUserRole,
  deleteAnyAccount,
  getAllApprovedUsers,
  getUnapprovedUsers,
  getPendingApplication,
  approveDistributor,
  rejectDistributor,
  getAllApprovedDistributor,
  getAllRejectedDistributor
} from "../controllers/admin.controller.js";
const router=Router();

/* ----------------  PROTECTED ADMIN ROUTES ---------------- */
router.use(verifyJWT, isAdmin);
/* USER MANAGEMENT */
router.route("/users").get(getAllUser);
router.route("/users/approved").get(getAllApprovedUsers);
router.route("/users/unapproved").get(getUnapprovedUsers);
router.route("/users/:userId").get(getUserById);
router.route("/users/:userId/role").patch(changeUserRole);
router.route("/users/:userId").delete(deleteAnyAccount);
/* DISTRIBUTOR APPLICATION FLOW */
router.route("/distributor/pending").get(getPendingApplication);

router.route("/distributor/approve/:applicationId").patch(approveDistributor);
router.route("/distributor/reject/:applicationId").patch(rejectDistributor);

router.route("/distributor/approved").get(getAllApprovedDistributor);
router.route("/distributor/rejected").get(getAllRejectedDistributor);




export default router