import express from "express";
import {
    addBillsController,
    getBillsController,
    getProductsByCustomerId,
    updateBillController,
    getBillByIdController,
} from "../controllers/billsController.js";

const billsRouter = express.Router();


// Add a new bill
billsRouter.post("/addbills", addBillsController);

// Get all bills
billsRouter.get("/getbills", getBillsController);

// Get products by customer ID
billsRouter.get("/products-by-customer/:customerId", getProductsByCustomerId);

// Update a bill
billsRouter.put("/updatebill", updateBillController);

// Get a single bill by ID
billsRouter.get("/:id", getBillByIdController);

export default billsRouter;
