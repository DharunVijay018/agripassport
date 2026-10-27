# AgriPassport Deployment Guide

This document describes how to deploy the AgriPassport application for local development, academic demonstrations, and production hosting environments.

---

## 1. Local Development Deployment

### Prerequisites
- **Node.js**: v20.0.0 or later (v24.x recommended; built-in `node:sqlite` supported)
- **npm**: v9.x or later
- **Git**: Installed and configured

### Step-by-Step Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/DharunVijay018/agripassport.git
cd agripassport

# 2. Install dependencies
npm install

# 3. Configure local environment
cp .env.example .env

# 4. Initialize and seed SQLite database
npm run seed

# 5. Run test suite to verify system integrity
npm test

# 6. Start full-stack development servers concurrently
npm run dev
```

The application will be accessible at:
- **Frontend Web UI:** `http://localhost:5173`
- **Backend REST API:** `http://localhost:3001/api`
- **API Health Check:** `http://localhost:3001/api/health`

---

## 2. Production Build

To compile both backend TypeScript and frontend Vite assets for production:

```bash
npm run build
```

This command executes:
1. `npm run build:backend`: Compiles `backend/src` into `backend/dist` using `tsc`.
2. `npm run build:frontend`: Builds optimized HTML, CSS, and JS bundles into `frontend/dist`.

### Previewing the Production Frontend
```bash
npm run preview
```

### Running the Production Server
```bash
npm run start
```

---

## 3. Cloud Deployment Options

### Option A: Monolithic Node.js Server (e.g. Render, Railway, AWS EC2)
The backend can serve the static frontend bundle from `frontend/dist`:

```typescript
// In backend/src/app.ts:
import path from 'path';
app.use(express.static(path.resolve(process.cwd(), 'frontend/dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'frontend/dist/index.html'));
});
```

### Option B: Decoupled Cloud Hosting (Vercel + Railway/Render)
1. **Frontend**: Deploy `frontend/` to **Vercel** or **Netlify**.
   - Build command: `npm run build:frontend`
   - Output directory: `frontend/dist`
   - Environment variable: `VITE_API_BASE_URL=https://your-backend-api.com/api`
2. **Backend**: Deploy `backend/` to **Render** or **Railway**.
   - Start command: `node backend/dist/server.js`
   - Environment variable: `DATABASE_PATH=/persistent/data/agripassport.sqlite`
   - Mount a persistent volume for the SQLite database.

---

## 4. Production Checklist

- [ ] Ensure `NODE_ENV=production` is set in the production environment.
- [ ] Verify that CORS origin matches the production domain.
- [ ] Configure automated daily backup for `data/agripassport.sqlite`.
- [ ] Never commit `.env` or any private keys to source control.
- [ ] If connecting to live Polygon Amoy testnet, fund the relayer wallet with testnet MATIC and configure `BLOCKCHAIN_MODE=polygon_amoy`.
