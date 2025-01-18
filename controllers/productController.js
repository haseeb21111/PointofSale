import Product from "../models/productModel.js";
import Seller from "../models/sellerModel.js"; // Import Seller model

// Fetch all products and include seller data
export const getProductController = async (req, res) => {
    try {
        // Populate the `sellerId` field with the seller's details from the Seller model
        const products = await Product.find().populate('sellerId');
        res.status(200).send(products);
    } catch (error) {
        console.log("Error fetching products:", error);
        res.status(500).send({ message: "Failed to fetch products" });
    }
};

// Fetch products by seller ID
export const getProductsBySeller = async (req, res) => {
    const { sellerId } = req.params;
    try {
        const products = await Product.find({ sellerId });
        console.log(`Products for seller ${sellerId}:`, products); // Debug log
        res.status(200).json(products);
    } catch (error) {
        console.log("Error fetching products for seller:", error);
        res.status(500).json({ message: "Error fetching products for the seller", error });
    }
};

// Add a new product
// Add a new product
export const addProductController = async (req, res) => {
    try {
        const { name, category, quantity, price, buyingPrice, paidAmount } = req.body;

        if (!name || !category || !quantity || !price || !buyingPrice || !paidAmount) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const dueAmount = buyingPrice * quantity - paidAmount;

        const newProduct = new Product({
            name,
            category,
            quantity,
            price,
            buyingPrice,
            paidAmount,
            dueAmount,
            image: req.body.image || "", // Default empty string for optional fields
            imei1: req.body.imei1 || "",
            imei2: req.body.imei2 || "",
            description: req.body.description || "",
            sellerId: req.body.sellerId || null, // Handle optional sellerId
        });

        const savedProduct = await newProduct.save();
        res.status(200).json({ message: "Product Created Successfully!", savedProduct });
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ message: "Failed to create product", error });
    }
};

// Fetch products with due amounts
export const getProductsWithDueAmounts = async (req, res) => {
    try {
        const productsWithDues = await Product.find({ dueAmount: { $gt: 0 } }).populate('sellerId');
        res.status(200).json(productsWithDues);
    } catch (error) {
        console.error('Error fetching products with due amounts:', error);
        res.status(500).json({ message: 'Error fetching products with due amounts' });
    }
};

// Clear product due amount
export const clearProductDueAmount = async (req, res) => {
    try {
        const { productId } = req.params;
        const { paymentAmount } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Deduct the payment from the due amount
        product.dueAmount -= paymentAmount;

        if (product.dueAmount < 0) {
            return res.status(400).json({ message: 'Payment exceeds due amount' });
        }

        await product.save();
        res.status(200).json({ message: 'Due amount cleared', product });
    } catch (error) {
        console.error('Error clearing product due amount:', error);
        res.status(500).json({ message: 'Error clearing product due amount' });
    }
};


// Update a product
export const updateProductController = async (req, res) => {
    try {
        const { productId, name, category, quantity, price, buyingPrice, paidAmount } = req.body;

        if (!productId || !name || !category || !quantity || !price || !buyingPrice || !paidAmount) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const dueAmount = buyingPrice * quantity - paidAmount;

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId },
            {
                ...req.body,
                dueAmount,
                image: req.body.image || "", // Default to empty string for optional fields
                imei1: req.body.imei1 || "",
                imei2: req.body.imei2 || "",
                description: req.body.description || "",
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({ message: "Product Updated Successfully!", updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product", error });
    }
};



// Delete a product
export const deleteProductController = async (req, res) => {
    try {
        await Product.findOneAndDelete({ _id: req.body.productId });
        res.status(200).json("Product Deleted!");
    } catch (error) {
        console.log("Error deleting product:", error);
        res.status(400).send(error);
    }
};



