# Budget Visualizer - Task Runner

# Install all dependencies
install:
    @echo "Installing backend dependencies..."
    cd backend && npm install
    @echo "Installing frontend dependencies..."
    cd frontend && npm install
    @echo "Dependencies installed!"

# Build both frontend and backend
build:
    @echo "Building backend..."
    cd backend && npm run build
    @echo "Building frontend..."
    cd frontend && npm run build
    @echo "Build complete!"

# Start the backend server in development mode
backend:
    cd backend && npm run dev

# Start the frontend in development mode
frontend:
    cd frontend && npm run dev

# Start both backend and frontend with process-compose (single terminal)
dev:
    process-compose

# Alias for process-compose
pc:
    process-compose

# Start both backend and frontend manually (requires two terminals)
dev-manual:
    @echo "Start backend with: just backend"
    @echo "Start frontend with: just frontend"
    @echo "Or run them in separate terminals"

# Clean build artifacts and node_modules
clean:
    @echo "Cleaning build artifacts..."
    rm -rf backend/dist
    rm -rf backend/node_modules
    rm -rf frontend/dist
    rm -rf frontend/node_modules
    @echo "Clean complete!"

# Clean only build artifacts (keep node_modules)
clean-build:
    @echo "Cleaning build artifacts..."
    rm -rf backend/dist
    rm -rf frontend/dist
    @echo "Clean complete!"

# Run backend in production mode
prod-backend:
    cd backend && npm start

# Lint and format Nix files
fmt:
    nixfmt nix/*.nix flake.nix

# Show help
help:
    @echo "Available commands:"
    @just --list
