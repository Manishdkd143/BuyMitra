import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { addAddress } from "../controllers/address.controller.js";
const router=Router();
router.use(verifyJWT)
router.route("/create").post(addAddress)
export default router