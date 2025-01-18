import express from "express";
import { getEarningsController } from "../controllers/earningController.js";

const router = express.Router();

// Route to fetch cumulative earnings and profit
router.get("/earnings", getEarningsController);

export default router;
