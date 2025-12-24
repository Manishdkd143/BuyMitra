import Router from "express"
import { forgotPassword, resetPassword, userLogin, userLogout, userRegister } from "../controllers/user.controller.js"
import { adminLogin, adminRegister } from "../controllers/admin.controller.js"
import { Upload } from "../middleware/multer.middleware.js"
import verifyJWT from "../middleware/auth.middleware.js"
const router=Router()
router.route("/register").post(Upload.single("profilePic"),userRegister)
router.route("/login").post(userLogin)
router.route("/logout").post(verifyJWT,userLogout)
router.route("/forgotpassword").post(forgotPassword);
router.post("/resetpassword/:token", resetPassword);
// Admin Register
router.route("/admin/register").post(Upload.single("profilePic"),adminRegister)

// Admin Login
router.post("/admin/login", adminLogin);
export default router