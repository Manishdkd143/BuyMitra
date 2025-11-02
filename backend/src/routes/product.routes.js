import Router from "express"
import { isAdminOrDistributor } from "../middleware/role.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { createProduct } from "../controllers/product.controller.js";
import { Upload } from "../middleware/multer.middleware.js";
const router=Router();
router.route("/create").post(verifyJWT,isAdminOrDistributor,Upload.array("images",5),createProduct)
export default router