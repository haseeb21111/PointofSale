import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String }, // Not mandatory
  cnic: { type: String, required: true, unique: true },
  cnicImage1: { type: String }, // Not mandatory
  cnicImage2: { type: String }  // Not mandatory
}, {
  timestamps: true
});

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
