import { Router, Request, Response } from 'express';
import { Budget } from '../models/budget';
import { saveBudget, loadBudget, listBudgets, deleteBudget } from '../services/csvService';
import { calculateBalanceOverTime, calculateSuggestedContribution } from '../services/calculationService';

const router = Router();

/**
 * GET /api/budgets
 * List all available budgets
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const budgets = await listBudgets();
    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list budgets' });
  }
});

/**
 * GET /api/budgets/:name
 * Load a specific budget
 */
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const budget = await loadBudget(req.params.name);
    res.json(budget);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load budget';
    res.status(404).json({ error: message });
  }
});

/**
 * POST /api/budgets
 * Save a budget
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const budget: Budget = req.body;

    // Validate budget
    if (!budget.name || typeof budget.initialValue !== 'number' || typeof budget.monthlyContribution !== 'number') {
      return res.status(400).json({ error: 'Invalid budget data' });
    }

    await saveBudget(budget);
    res.json({ success: true, message: 'Budget saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

/**
 * DELETE /api/budgets/:name
 * Delete a budget
 */
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    await deleteBudget(req.params.name);
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete budget';
    res.status(404).json({ error: message });
  }
});

/**
 * POST /api/budgets/calculate
 * Calculate balance over time for a budget (without saving)
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const budget: Budget = req.body;

    // Validate budget
    if (typeof budget.initialValue !== 'number' || typeof budget.monthlyContribution !== 'number') {
      return res.status(400).json({ error: 'Invalid budget data' });
    }

    const balanceData = calculateBalanceOverTime(budget);
    res.json({ balanceData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate balance' });
  }
});

/**
 * POST /api/budgets/suggest
 * Calculate suggested monthly contribution
 */
router.post('/suggest', async (req: Request, res: Response) => {
  try {
    const budget: Budget = req.body;

    // Validate budget
    if (typeof budget.initialValue !== 'number' || !Array.isArray(budget.purchases)) {
      return res.status(400).json({ error: 'Invalid budget data' });
    }

    const suggestion = calculateSuggestedContribution(budget);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate suggestion' });
  }
});

export default router;
