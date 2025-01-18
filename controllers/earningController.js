import Earnings from "../models/earningsModel.js";

// Controller to fetch cumulative earnings and profit
export const getEarningsController = async (req, res) => {
    try {
        // Find the earnings document, or default to zero if not found
        const earnings = await Earnings.findOne() || { totalEarnings: 0, totalProfit: 0 };
        res.json(earnings);
    } catch (error) {
        console.log("Error fetching earnings:", error);
        res.status(500).send("Server error");
    }
};
