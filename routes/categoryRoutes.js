// routes/categoryRoutes.js
import express from 'express';
import { getCategories, addCategory } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.post('/categories', addCategory);

export default router;
