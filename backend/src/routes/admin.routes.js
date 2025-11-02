import { Router } from "express";
import { isAdmin } from "../middleware/role.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { approvalUser, changeUserRole, deleteAnyAccount, getAllApprovedUser, getAllUser, getUnApprovedUser, getUserById } from "../controllers/admin.controller.js";
const router=Router();
router.route("/users/approvedusers").get(verifyJWT, isAdmin, getAllApprovedUser);
router.route("/users/unapprovedusers").get(verifyJWT, isAdmin, getUnApprovedUser);
router.route("/users/role/:userId").patch(verifyJWT, isAdmin, changeUserRole);
router.route("/users/approval/:userId").patch(verifyJWT, isAdmin, approvalUser);
router.route("/users/:userId").get(verifyJWT, isAdmin, getUserById);
router.route("/users/:userId").post(verifyJWT, isAdmin, deleteAnyAccount);
router.route("/users").get(verifyJWT, isAdmin, getAllUser);

export default router