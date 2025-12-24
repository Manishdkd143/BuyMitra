import { Router } from "express";
import { applyForDistributor, deleteProfilePic, forgotPassword, getAllApprovedDistributors, getCurrentUser, refreshAccessToken, removeAccount, resetPassword, updatePassword, updateProfilePic, updateUserdetails, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import { Upload } from "../middleware/multer.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
const router=Router();
router.route('/profile').get(verifyJWT,getCurrentUser)
router.route("/users/update-password").patch(verifyJWT,updatePassword)
router.route("/changeprofile").patch(verifyJWT,Upload.single("profilePic"),updateProfilePic)
router.route("/delete-account").delete(verifyJWT,removeAccount)
router.route("/delete-profile").delete(verifyJWT,deleteProfilePic)
router.route("/updateinfo").post(verifyJWT,updateUserdetails)
router.route("/refresh-token").post(refreshAccessToken)
// router.route("/forgotpassword").post(forgotPassword)
// router.route("/reset-password/:token").post(resetPassword)
router.route("/apply-distributor").post(verifyJWT,Upload.fields([
    {name:"gstCertificate",maxCount:1},
    {name:"businessProof",maxCount:1},
]),applyForDistributor)
router.route("/distributors").get(getAllApprovedDistributors)
export default router