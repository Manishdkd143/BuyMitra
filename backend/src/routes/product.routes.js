import Router from "express"
import { isAdmin, isAdminOrDistributor } from "../middleware/role.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";
import {bulkUploadProducts,  createProduct,
     getAllProducts, 
     getProductDetails,  deleteProduct,
    updateProdImages,
       updateProductdetails, 
       getLowStockProducts,
       getOutStockProducts} from "../controllers/product.controller.js"
import { Upload } from "../middleware/multer.middleware.js";
const router=Router();
//public routes
router.use(verifyJWT)
router.route("/").get(getAllProducts)
router.route("/:productId").get(isAdminOrDistributor,getProductDetails);
router.route("/i/low-stock").get(isAdminOrDistributor,getLowStockProducts)
router.route("/i/out-stock").get(isAdminOrDistributor,getOutStockProducts)

router.route("/create").post(verifyJWT,isAdminOrDistributor,Upload.array("images",5),createProduct)
router.route("/delete/:productId").delete(verifyJWT,isAdminOrDistributor,deleteProduct)
router.route("/update/:productId").patch(verifyJWT,isAdminOrDistributor, Upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),updateProductdetails)
router.route("/updateimages/:productId").patch(verifyJWT,isAdminOrDistributor,Upload.array("images",5),updateProdImages)
// router.route("/toggle/:productId").patch(verifyJWT,isAdminOrDistributor,toggleVerify);
// router.route("/unverified").get(verifyJWT,isAdminOrDistributor,unVerifiedProducts)
// router.route("/c/product").get(verifyJWT,isAdminOrDistributor,getProductByIdOrSlug)
// router.route("/stock/:productId").patch(verifyJWT,isAdminOrDistributor,stockUpdate)
// router.route("/lowStock").get(verifyJWT,isAdminOrDistributor,lowStock)
// router.route("/alldelete").delete(verifyJWT,isAdminOrDistributor,deleteAllProducts)
// router.route("/bulkdelete").delete(verifyJWT,isAdminOrDistributor,bulkdelete)
router.route("/uploadfile").post(verifyJWT,isAdminOrDistributor,Upload.single("csvfile"),bulkUploadProducts)
// router.route("/bulkVerify").patch(verifyJWT,isAdminOrDistributor,bulkVerify)
//Admin
// router.route("/all").get(verifyJWT,isAdminOrDistributor,allProductsByAdminAndDist)
// router.route("/stats").get(verifyJWT,isAdminOrDistributor,stats)
export default router