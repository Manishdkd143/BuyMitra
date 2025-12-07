import Router from "express";
import { cashfreeWebHook} from "../controllers/webhook.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router =Router();
router.use(verifyJWT)
router.route("/cashfree", cashfreeWebHook);

export default router;