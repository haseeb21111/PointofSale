// models/InvestmentModel.js
import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
    totalInvestment: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('Investment', investmentSchema);
