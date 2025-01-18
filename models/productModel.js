import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  buyingPrice: { type: Number },
  image: { type: String },
  imei1: { type: String },
  imei2: { type: String },
  paidAmount: { type: Number, default: 0 }, // Field for Paid Amount
  dueAmount: { type: Number, default: 0 },  // Field for Due Amount
  description: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" } // Reference to the Seller
}, {
  timestamps: true
});


const Product = mongoose.model("Product", productSchema);
export default Product;
