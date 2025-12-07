import express from 'express';
import cors from 'cors';
import budgetRoutes from './routes/budgets';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/budgets', budgetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Budget Viz API server running on http://localhost:${PORT}`);
});
