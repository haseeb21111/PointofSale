import mongoose from "mongoose";

const earningsSchema = new mongoose.Schema(
  {
    totalEarnings: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Earnings = mongoose.model("Earnings", earningsSchema);
export default Earnings;
