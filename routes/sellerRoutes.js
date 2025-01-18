import express from 'express';
import { addSellerController, getSellersController, getSellerByIdController } from '../controllers/sellerController.js';
import { updateSellerController } from '../controllers/sellerController.js';
const router = express.Router();

router.post('/addseller', addSellerController); // Route to add seller info
router.get('/getsellers', getSellersController); // Route to get all sellers
router.get('/:id', getSellerByIdController);     // Route to get a seller by ID
router.put('/update/:id', updateSellerController); // Route to update seller info

export default router;
