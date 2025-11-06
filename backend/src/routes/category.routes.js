import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { isAdminOrDistributor } from "../middleware/role.middleware.js";
import { create, deleteCategory, getAllCategories, getCategoryById, getCategoryStats, getProductByCategory, updateCategoryDetails } from "../controllers/category.controller.js";
const router=Router();
router.use(verifyJWT)
router.route("/create").post(isAdminOrDistributor,create);
router.route("/delete/:categoyId").post(isAdminOrDistributor,deleteCategory);
router.route("/all").get(isAdminOrDistributor,getAllCategories);
router.route("/c/:categoryId").get(isAdminOrDistributor,getCategoryById)
router.route("/update/:categoryId").patch(isAdminOrDistributor,updateCategoryDetails)
router.route("/stats").get(isAdminOrDistributor,getCategoryStats);
router.route("/products").get(isAdminOrDistributor,getProductByCategory)
export default router;