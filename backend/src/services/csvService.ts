import * as fs from 'fs/promises';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Budget, Purchase } from '../models/budget';

const DATA_DIR = process.env.BUDGETVIZ_DATA_DIR || path.join(__dirname, '../../data');

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Get file path for a budget
 */
function getBudgetFilePath(budgetName: string): string {
  const sanitizedName = budgetName.replace(/[^a-zA-Z0-9-_]/g, '_');
  return path.join(DATA_DIR, `${sanitizedName}.csv`);
}

/**
 * Save budget to CSV file
 * Format:
 * - Line 1: name,initialValue,monthlyContribution
 * - Line 2+: purchase_date,purchase_amount,purchase_description
 */
export async function saveBudget(budget: Budget): Promise<void> {
  await ensureDataDir();

  const rows: string[][] = [];

  // Header row with budget metadata
  rows.push(['name', 'initialValue', 'monthlyContribution']);
  rows.push([budget.name, budget.initialValue.toString(), budget.monthlyContribution.toString()]);

  // Empty row separator
  rows.push([]);

  // Purchase header
  rows.push(['date', 'amount', 'description', 'enabled']);

  // Purchase data
  for (const purchase of budget.purchases) {
    rows.push([
      purchase.date,
      purchase.amount.toString(),
      purchase.description,
      purchase.enabled.toString()
    ]);
  }

  const csvContent = stringify(rows);
  const filePath = getBudgetFilePath(budget.name);

  await fs.writeFile(filePath, csvContent, 'utf-8');
}

/**
 * Load budget from CSV file
 */
export async function loadBudget(budgetName: string): Promise<Budget> {
  const filePath = getBudgetFilePath(budgetName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const rows = parse(content, {
      skip_empty_lines: true,
      relax_column_count: true  // Allow rows with different column counts
    }) as string[][];

    if (rows.length < 2) {
      throw new Error('Invalid budget file format');
    }

    // Parse budget metadata (skip header row, read data row)
    const metadataRow = rows[1];
    const name = metadataRow[0];
    const initialValue = parseFloat(metadataRow[1]);
    const monthlyContribution = parseFloat(metadataRow[2]);

    // Parse purchases (find the purchases header, then read subsequent rows)
    const purchases: Purchase[] = [];
    let purchaseHeaderIndex = -1;

    for (let i = 2; i < rows.length; i++) {
      if (rows[i][0] === 'date' && rows[i][1] === 'amount') {
        purchaseHeaderIndex = i;
        break;
      }
    }

    if (purchaseHeaderIndex >= 0) {
      for (let i = purchaseHeaderIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 3) {
          purchases.push({
            date: row[0],
            amount: parseFloat(row[1]),
            description: row[2] || '',
            // Backward compatibility: default to true if enabled field not present
            enabled: row[3] !== undefined ? row[3] === 'true' : true
          });
        }
      }
    }

    return {
      name,
      initialValue,
      monthlyContribution,
      purchases
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Budget '${budgetName}' not found`);
    }
    throw error;
  }
}

/**
 * List all available budgets
 */
export async function listBudgets(): Promise<string[]> {
  await ensureDataDir();

  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter(file => file.endsWith('.csv'))
      .map(file => file.replace('.csv', ''));
  } catch {
    return [];
  }
}

/**
 * Delete a budget
 */
export async function deleteBudget(budgetName: string): Promise<void> {
  const filePath = getBudgetFilePath(budgetName);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Budget '${budgetName}' not found`);
    }
    throw error;
  }
}
