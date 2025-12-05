import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { addAddress, deleteAddress, getAllAddresses, setDefaultAddress, updateAddress } from "../controllers/address.controller.js";
const router=Router();
router.use(verifyJWT)
router.route("/create").post(addAddress);
router.route("/update/:addressId").patch(updateAddress);
router.route("/delete/:addressId").delete(deleteAddress);
router.route("/all-address").get(getAllAddresses);
router.route("/set-default/:addressId").patch(setDefaultAddress)
export default router