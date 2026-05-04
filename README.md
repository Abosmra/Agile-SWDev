# Agile Software Development Project

## Phase 1 — Deadline: Friday 17th April 2026

> One sprint required (no implementation).

### Submission Checklist

- [x] Document describing feature prioritization (technique used, etc.)
- [x] Document describing the Product Backlog Items (PBIs) included in the MVP
- [x] Link to Jira showing the features included in the MVP
- [x] Document showing the splitting of large user stories (technique used, etc.)
- [x] Team Definition of Done (DoD) included in the document
- [x] Names/IDs of all team members included in the document

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
