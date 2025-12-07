import express from 'express';
import cors from 'cors';
import path from 'path';
import budgetRoutes from './routes/budgets';

const app = express();
const PORT = process.env.PORT || 5173;
const FRONTEND_DIR = process.env.FRONTEND_DIR || path.join(__dirname, '../../frontend/dist');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/budgets', budgetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(FRONTEND_DIR));

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Budget Viz server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Serving frontend from ${FRONTEND_DIR}`);
  }
});
