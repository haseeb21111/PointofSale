// controllers/InvestmentController.js
import Investment from '../models/InvestmentsModel.js';




// Controller to add buying price to the cumulative investment
export const addInvestment = async (req, res) => {
    try {
        const { buyingPrice } = req.body;

        // Find or create an investment document
        let investment = await Investment.findOne({});
        if (!investment) {
            investment = new Investment({ totalInvestment: 0 });
        }

        // Update the cumulative investment
        investment.totalInvestment += buyingPrice;
        await investment.save();

        res.status(200).json({ totalInvestment: investment.totalInvestment });
    } catch (error) {
        console.error("Error updating investment:", error);
        res.status(500).json({ message: 'Error updating investment', error });
    }
};

// Controller to fetch the current investment total
export const getInvestmentTotal = async (req, res) => {
    try {
        const investment = await Investment.findOne({});
        res.status(200).json({ totalInvestment: investment ? investment.totalInvestment : 0 });
    } catch (error) {
        console.error("Error fetching investment total:", error);
        res.status(500).json({ message: 'Error fetching investment total', error });
    }
};
// InvestmentController.js
export const deductInvestment = async (req, res) => {
    try {
        const { amount } = req.body;

        // Find the investment document
        let investment = await Investment.findOne({});
        if (investment) {
            // Deduct the specified amount from the total investment
            investment.totalInvestment -= amount;
            await investment.save();

            res.status(200).json({ totalInvestment: investment.totalInvestment });
        } else {
            res.status(400).json({ message: 'Investment record not found.' });
        }
    } catch (error) {
        console.error("Error deducting investment:", error);
        res.status(500).json({ message: 'Error deducting investment', error });
    }
};
