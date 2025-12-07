# Budget Visualizer

A self-hosted web application for visualizing budget balances over time. Track your initial budget, monthly contributions, and planned purchases to see how your budget evolves.

## Features

- **Budget Configuration**: Set initial budget value and monthly contribution
- **Purchase Planning**: Add, edit, and remove planned purchases with dates
- **Visual Analytics**: Interactive chart showing budget balance over time
- **Smart Suggestions**: Get suggested monthly contribution to reach zero balance after all purchases
- **Budget Management**: Save and load multiple budgets as CSV files
- **Monthly Contributions**: Applied at the end of each month

## Tech Stack

- **Frontend**: Vue 3 + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Charting**: Chart.js with vue-chartjs
- **Data Storage**: CSV files

## Project Structure

```
budgetviz/
├── backend/           # Express API server
│   ├── src/
│   │   ├── models/    # TypeScript interfaces
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── server.ts  # Main server file
│   └── data/          # CSV storage directory
├── frontend/          # Vue application
│   └── src/
│       ├── components/ # Vue components
│       ├── services/   # API client
│       └── App.vue     # Main app component
└── README.md
```

## Installation

This project uses Nix for development environment management. Make sure you have Nix with flakes enabled.

### Quick Start with Just

```bash
# Enter the Nix development shell
nix develop

# Install all dependencies
just install

# Start both backend and frontend with process-compose (single terminal)
just dev
```

The `just dev` command uses process-compose to run both services in a single terminal with:
- Automatic restart on failure
- Health checks for both services
- Integrated log viewing
- Easy process management (press 's' to stop a process, 'r' to restart)

### Manual Installation

If you prefer to install manually:

**Backend:**
```bash
nix develop --command bash -c "cd backend && npm install"
```

**Frontend:**
```bash
nix develop --command bash -c "cd frontend && npm install"
```

## Running the Application

### Recommended: Use Process-Compose (Single Terminal)

```bash
just dev
# or
process-compose
```

This starts both backend and frontend with automatic health checks and restart capabilities.

**Process-Compose Controls:**
- `q` - Quit process-compose (stops all processes)
- `s` - Stop a specific process
- `r` - Restart a specific process
- `l` - View logs for a process
- `↑/↓` - Navigate between processes

The backend runs on `http://localhost:3000` and frontend on `http://localhost:5173`

### Alternative: Manual Start (Separate Terminals)

**Backend:**
```bash
just backend
# or
nix develop --command bash -c "cd backend && npm run dev"
```

**Frontend:**
```bash
just frontend
# or
nix develop --command bash -c "cd frontend && npm run dev"
```

## Usage

1. **Configure Budget**: Enter a budget name, initial value, and monthly contribution
2. **Add Purchases**: Plan your purchases by adding dates, amounts, and descriptions
3. **Visualize**: See your budget balance over time in the chart
4. **Get Suggestions**: View the suggested monthly contribution to reach zero balance
5. **Save/Load**: Save your budget to a CSV file or load previously saved budgets

## API Endpoints

- `GET /api/budgets` - List all budgets
- `GET /api/budgets/:name` - Load a specific budget
- `POST /api/budgets` - Save a budget
- `DELETE /api/budgets/:name` - Delete a budget
- `POST /api/budgets/calculate` - Calculate balance over time
- `POST /api/budgets/suggest` - Get suggested monthly contribution

## CSV File Format

Budget CSV files are stored in `backend/data/` with the following format:

```csv
name,initialValue,monthlyContribution
My Budget,1000.00,200.00

date,amount,description
2025-01-15,300.00,Laptop
2025-02-01,150.00,Software subscription
```

## Available Commands (Just)

This project includes a `justfile` for common tasks:

- `just install` - Install all dependencies (both backend and frontend)
- `just dev` - Start both backend and frontend with process-compose (recommended)
- `just pc` - Alias for process-compose
- `just backend` - Start backend development server only
- `just frontend` - Start frontend development server only
- `just dev-manual` - Show instructions for manual startup
- `just build` - Build both backend and frontend for production
- `just clean` - Remove all build artifacts and node_modules
- `just clean-build` - Remove only build artifacts (keep dependencies)
- `just prod-backend` - Run backend in production mode
- `just fmt` - Format Nix files
- `just help` - Show all available commands

## Building for Production

### Using Just

```bash
just build
```

### Manual Build

**Backend:**
```bash
nix develop --command bash -c "cd backend && npm run build"
nix develop --command bash -c "cd backend && npm start"
```

**Frontend:**
```bash
nix develop --command bash -c "cd frontend && npm run build"
```

The built files will be in `frontend/dist/` and can be served with any static file server.

## License

MIT
