// routes/InvestmentRoutes.js
import express from 'express';
import { addInvestment, getInvestmentTotal, deductInvestment } from '../controllers/InvestmentController.js';

const router = express.Router();

// Route to update investment with buying price
router.post('/investment/add', addInvestment);

// Route to fetch the current investment total
router.get('/investment', getInvestmentTotal);
router.post('/investment/deduct', deductInvestment);

export default router;
