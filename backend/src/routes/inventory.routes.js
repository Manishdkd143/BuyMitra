import express from "express";
import {
  addInventory,
  updateInventory,
  deleteInventory,
  getInventory,
  getInventoryById
} from "../controllers/inventory.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// APPLY JWT AUTH ON ALL ROUTES
router.use(verifyJWT);

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
