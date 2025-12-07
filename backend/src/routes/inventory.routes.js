import Router from "express";
import {
  addInventory,
  updateInventory,
  deleteInventory,
  getInventory,
  getInventoryById
} from "../controllers/inventory.controller.js";

import { isAdminOrDistributor } from "../middleware/role.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router =Router();

// APPLY JWT AUTH ON ALL ROUTES
router.use(verifyJWT,isAdminOrDistributor);

// GET ALL + SEARCH + PAGINATION
router.route("/")
  .get(getInventory)       // /api/inventory?page=1&limit=10&search=phone
  .post(addInventory);     // /api/inventory   (add inventory)

// SINGLE INVENTORY CRUD
router.route("/:id")
  .get(getInventoryById)   // /api/inventory/6767aghfj   (get by id)
  .put(updateInventory)    // update
  .delete(deleteInventory) // delete
;

export default router;
