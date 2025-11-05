import Router from "express"
import { isAdmin, isAdminOrDistributor } from "../middleware/role.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { allProductsByAdminAndDist, bulkdelete, bulkUploadProducts, bulkVerify, createProduct, deleteAllProducts, getAllProducts, getProductByIdOrSlug, getProductDetails, lowStock, removeProduct, stats, stockUpdate, toggleVerify, unVerifiedProducts, updateProdImages, updateProductdetails } from "../controllers/product.controller.js";
import { Upload } from "../middleware/multer.middleware.js";
const router=Router();
//public routes
router.route("/").get(getAllProducts)
router.route("/product/:slug").get(getProductDetails);

router.route("/create").post(verifyJWT,isAdminOrDistributor,Upload.array("images",5),createProduct)
router.route("/delete/:productId").delete(verifyJWT,isAdminOrDistributor,removeProduct)
router.route("/update/:productId").patch(verifyJWT,isAdminOrDistributor,updateProductdetails)
router.route("/updateimages/:productId").patch(verifyJWT,isAdminOrDistributor,Upload.array("images",5),updateProdImages)
router.route("/toggle/:productId").patch(verifyJWT,isAdminOrDistributor,toggleVerify);
router.route("/unverified").get(verifyJWT,isAdminOrDistributor,unVerifiedProducts)
router.route("/c/product").get(verifyJWT,isAdminOrDistributor,getProductByIdOrSlug)
router.route("/stock/:productId").patch(verifyJWT,isAdminOrDistributor,stockUpdate)
router.route("/lowStock").get(verifyJWT,isAdminOrDistributor,lowStock)
router.route("/alldelete").post(verifyJWT,isAdminOrDistributor,deleteAllProducts)
router.route("/bulkdelete").post(verifyJWT,isAdminOrDistributor,bulkdelete)
router.route("/uploadfile").post(verifyJWT,isAdminOrDistributor,Upload.single("csvfile"),bulkUploadProducts)
router.route("/bulkVerify").post(verifyJWT,isAdminOrDistributor,bulkVerify)
//Admin
router.route("/all").get(verifyJWT,isAdminOrDistributor,allProductsByAdminAndDist)
router.route("/stats").get(verifyJWT,isAdminOrDistributor,stats)
export default router