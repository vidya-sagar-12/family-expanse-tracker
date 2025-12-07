// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import billRoutes from "./routes/BillRoutes.js";
import debtRoutes from "./routes/debtRoutes.js"
import savingRoutes from "./routes/savingRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/expenses', expenseRoutes);
app.use("/api/bills", billRoutes);
app.use('/api/debts', debtRoutes);
app.use("/api/savings", savingRoutes);
app.use("/api/analytics", analyticsRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


















