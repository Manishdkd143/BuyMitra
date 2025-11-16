import Router from "express"
import verifyJWT from "../middleware/auth.middleware.js";
import { addToCart, calculateShipping, clearCart, deleteCart, getCartSummary, getUserCart, removeToCart, updateCartItemQuantity } from "../controllers/cart.controller.js";
const router=Router();
router.use(verifyJWT)
router.route("/create").post(addToCart)
router.route("/remove/:productId").post(removeToCart)
router.route('/cart').get(getUserCart)
router.route("/update/:productId").patch(updateCartItemQuantity)
router.route("/clear").post(clearCart)
router.route("/stats").get(getCartSummary);
router.route('/delete/:cartId').delete(deleteCart)
router.route('/shipping').post(calculateShipping)
export default router;