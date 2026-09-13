# Agile Software Development Project

## Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Agile-SWDev
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd Backend
   npm install
   cd ..
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Initialize the database** (first time only)
   ```bash
   cd Backend
   npm run init-db
   cd ..
   ```

## Quick Start

From the repository root:

```bash
npm start
```

Runs both backend (port 5000) and frontend (port 3000) in parallel.
