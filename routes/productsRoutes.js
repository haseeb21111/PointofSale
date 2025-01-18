import express from "express";
import { getProductController, addProductController, updateProductController, deleteProductController, getProductsBySeller, getProductsWithDueAmounts,
    clearProductDueAmount } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/getproducts", getProductController);
productRouter.post("/addproducts", addProductController);
productRouter.put("/updateproducts", updateProductController);
productRouter.post("/deleteproducts", deleteProductController);

// Route to get products by seller ID
productRouter.get("/by-seller/:sellerId", getProductsBySeller);
// Route to get products with due amounts
productRouter.get("/getDueProducts", getProductsWithDueAmounts);

// Route to clear product due amount
productRouter.post("/clearDue/:productId", clearProductDueAmount);
export default productRouter;
