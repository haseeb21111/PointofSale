import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRouter from './routes/productsRoutes.js';
import userRouter from './routes/userRoutes.js';
import billsRouter from './routes/billsRoutes.js';
import sellerRouter from './routes/sellerRoutes.js'; // Correct import for sellerRouter
import categoryRoutes from './routes/categoryRoutes.js';
import earningsRoutes from "./routes/earningsRoutes.js";
import investmentRoutes from './routes/InvestmentRoutes.js';


dotenv.config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Routes
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/bills', billsRouter);
app.use('/api/sellers', sellerRouter); // Register seller routes correctly
app.use('/api', categoryRoutes);
app.use("/api", earningsRoutes);
app.use('/api', investmentRoutes);

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
});
