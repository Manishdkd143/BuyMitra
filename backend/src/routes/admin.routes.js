import { Router } from "express";
import { isAdmin } from "../middleware/role.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { approvalUser, approveDistributor, changeUserRole, deleteAnyAccount, getAllApprovedDistributor, getAllApprovedUser, getAllRejectedDistributor, getAllUser, getPendingApplication, getUnApprovedUser, getUserById, rejectDistributor } from "../controllers/admin.controller.js";
const router=Router();

router.route("/users/pending-applications").get(verifyJWT,isAdmin,getPendingApplication);
router.route("/users/approve/:applicationId").post(verifyJWT,isAdmin,approveDistributor);
router.route("/users/reject/:applicationId").post(verifyJWT,isAdmin,rejectDistributor)
router.route("/users/rejected-distributor").get(verifyJWT,isAdmin,getAllRejectedDistributor)

router.route("/users/approved-distributor").get(verifyJWT, isAdmin, getAllApprovedDistributor);




router.route("/users/approvedusers").get(verifyJWT, isAdmin, getAllApprovedUser);
// router.route("/users/unapprovedusers").get(verifyJWT, isAdmin, getUnApprovedUser);
// router.route("/users/role/:userId").patch(verifyJWT, isAdmin, changeUserRole);
// router.route("/users/approval/:userId").patch(verifyJWT, isAdmin, approvalUser);
// router.route("/users/:userId").get(verifyJWT, isAdmin, getUserById);
// router.route("/users/:userId").post(verifyJWT, isAdmin, deleteAnyAccount);
router.route("/users").get(verifyJWT, isAdmin, getAllUser);



export default router