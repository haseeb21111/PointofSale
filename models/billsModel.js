import mongoose from "mongoose";

const billsSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: Number, required: true },
    customerAddress: { type: String, required: true },
    customerCNIC: { type: String, default: '' },
    subTotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    paymentMethod: { type: String, required: true },
    paidAmount: { type: Number, default: 0 }, // Add this
    remainingAmount: { type: Number, default: 0 }, // Add this
    cartItems: [{
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        dateTime: { type: Date, default: Date.now }
    }]
}, { timestamps: true });


const Bills = mongoose.model("Bills", billsSchema);
export default Bills;
