# AgriPassport 🌾
### AI-Powered Blockchain Digital Passport for Farm-to-Fork Traceability

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Tests: Vitest](https://img.shields.io/badge/Tests-20%2F20%20Passing-brightgreen.svg)](./docs/TESTING.md)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v24.x%20Built--in%20SQLite-darkgreen.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-purple.svg)](https://vitejs.dev/)

An open-source, full-stack digital traceability platform designed to eliminate information opacity, reduce post-harvest food waste, and provide cryptographically verifiable provenance for horticultural supply chains.

Developed as the **Innovative Design Lab–I** capstone project at **Sri Sairam Engineering College** by:
- **Dharun Vijay M** (Team Leader) — Register Number: `2503412510421063` ([GitHub: @DharunVijay018](https://github.com/DharunVijay018))
- **Bharani R** (Team Member) — Register Number: `2503412510421047`
- **Mithilesh N** (Team Member) — Register Number: `2503412510421159`

---

## Table of Contents
1. [Project Introduction](#project-introduction)
2. [Features (Implemented vs. Planned)](#features)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Installation and Quickstart](#installation-and-quickstart)
6. [Environment Variables](#environment-variables)
7. [Usage Guide](#usage-guide)
8. [Automated Testing & Quality Checks](#automated-testing--quality-checks)
9. [Architecture & Cryptography](#architecture--cryptography)
10. [Honest Technical Boundaries & Limitations](#honest-technical-boundaries--limitations)
11. [Roadmap](#roadmap)
12. [Team & License](#team--license)

---

## Project Introduction

### The Problem
In India, over **35% of fresh horticultural produce spoils** between harvest and retail shelves, representing an annual post-harvest loss exceeding **₹89,000 Crore**. Supply chains suffer from:
- Subjective and arbitrary quality grading at mandis.
- Unverifiable harvest dates and physical transit origins.
- Undetected temperature excursions in transit corridors.
- Asymmetric trust between smallholder farmers, transporters, and retailers.

### The Proposed Solution
**AgriPassport** bridges this transparency deficit by issuing a unique **Digital Passport** for every harvest consignment. The platform links farm origin metadata, handling checkpoints, and ambient transit logs into an immutable cryptographic chain anchored to a blockchain adapter, accessible to consumers and retailers through instant dynamic QR code scans.

### Intended Stakeholders
- **Farmers & FPOs**: Mint batch passports at harvest, protect produce value against arbitrary price write-downs.
- **Logistics & Transporters**: Log cold chain temperature checkpoints and prove handling compliance.
- **Aggregators & Wholesalers**: Perform rapid cross-docking gate verification in under 5 seconds.
- **Supermarket Retailers**: Verify remaining shelf life and origin before shelf placement.
- **Consumers**: Scan packaging tags using any smartphone camera to inspect produce origin and freshness.

---

## Features

### Implemented MVP Features
- [x] **Produce Batch Registration**: Full metadata registration (crop, cultivar, harvest timestamp, quantity, grade, GPS coordinates).
- [x] **Dynamic QR Tagging**: Generates Base64 PNG and SVG dynamic QR codes with downloadable packaging tag previews.
- [x] **Supply Chain Custody Checkpoints**: Append handling events (Harvest, Sorting, Cold Chain Loading, Transit, Retail Intake).
- [x] **Cryptographic Hash Chaining**: Every event computes a SHA-256 hash linking the previous checkpoint to construct a tamper-evident Merkle chain.
- [x] **Pluggable Blockchain Adapter (Mock Mode)**: Simulates Polygon Amoy Layer 2 transaction hashes (`0x...`), block heights, and local anchor verification.
- [x] **AI Freshness & Shelf-Life Heuristic Engine**: Dynamic calculation of freshness score (0–100%), remaining shelf life (days), and grade classification.
- [x] **Consumer Verification Portal**: Clean public interface to look up any batch ID and inspect its verified origin story.
- [x] **Ledger Explorer**: Interactive utility to audit any 64-character SHA-256 hash against the anchor registry.
- [x] **Seed & Reset Tooling**: One-command sample data loader featuring 4 farmers, 5 realistic produce batches, and 14 supply-chain events.

### Planned Future Features
- [ ] **Live Polygon Amoy Testnet Deployment**: Smart contracts for decentralized anchor state.
- [ ] **TFLite Computer Vision Freshness**: Edge neural network for surface defect and ripeness classification.
- [ ] **IoT Hardware Sync**: Direct Bluetooth Low Energy (BLE) temperature logger integration.
- [ ] **National Agriculture Market (e-NAM) Integration**: Smart contract escrow settlement.

---

## Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 6, Lucide Icons, Modern Responsive CSS |
| **Backend** | Node.js v24, Express, TypeScript, Zod Schema Validation |
| **Database** | Embedded SQLite (`node:sqlite` — zero native C++ compiler required) |
| **QR Code Engine**| `qrcode` (High error correction level `H`) |
| **Cryptography** | Node.js `crypto` (SHA-256 Merkle hash chaining) |
| **Testing** | Vitest 2, Supertest |
| **Development** | `tsx` (TypeScript execute runtime), `concurrently` |

---

## Prerequisites

- **Node.js**: `v20.0.0` or later (tested and verified on **Node v24.21.0**).
- **npm**: `v9.0.0` or later (tested on **npm 11.19.0**).
- **Git**: Installed on your system.

---

## Installation and Quickstart

Run these commands from your terminal:

```bash
# 1. Clone the repository
git clone https://github.com/DharunVijay018/agripassport.git
cd agripassport

# 2. Install all dependencies (root, backend, frontend)
npm install

# 3. Setup local environment configuration
cp .env.example .env

# 4. Seed the SQLite database with demonstration batches
npm run seed

# 5. Run the automated test suite
npm test

# 6. Start both backend and frontend development servers concurrently
npm run dev
```

Open your browser to:
- **Web Application UI:** `http://localhost:5173`
- **Backend API Health:** `http://localhost:3001/api/health`

---

## Environment Variables

All configuration is managed through `.env`. A complete template is tracked in `.env.example`.

| Variable Name | Purpose | Example Value | Required? | Exposure |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application environment mode | `development` | Yes | Server-only |
| `PORT` | Backend HTTP API port | `3001` | Yes | Server-only |
| `DATABASE_PATH` | Path to local SQLite database file | `./data/agripassport.sqlite` | Yes | Server-only |
| `FRONTEND_URL` | Allowed CORS origin for frontend | `http://localhost:5173` | Yes | Server-only |
| `VITE_API_BASE_URL` | Base API URL called by browser client | `http://localhost:3001/api` | Yes | **Frontend-Public** |
| `BLOCKCHAIN_MODE` | Blockchain adapter mode (`mock` or `polygon_amoy`)| `mock` | Yes | Server-only |
| `BLOCKCHAIN_RPC_URL` | RPC URL for Polygon Amoy testnet | `https://rpc-amoy.polygon.technology/` | Optional | Server-only |
| `BLOCKCHAIN_CHAIN_ID`| Network chain ID for Polygon Amoy | `80002` | Optional | Server-only |
| `BLOCKCHAIN_CONTRACT_ADDRESS`| Deployed testnet contract address | `""` | Optional | Server-only |
| `BLOCKCHAIN_PRIVATE_KEY` | Relayer wallet private key for live transactions | `""` | Optional | Server-only |
| `AI_FRESHNESS_MODE` | AI Freshness service calculation mode | `heuristic` | Yes | Server-only |

> [!CAUTION]
> **Zero Secret Commits**: Never commit `.env` or private keys to git. Variables with the `VITE_` prefix are compiled into client JavaScript bundles and are readable by any browser user.

---

## Usage Guide

### 1. Exploring Seeded Batches
Upon running `npm run seed`, 5 batches are available on the dashboard:
- `AGRI-BATCH-2026-TOM01`: Hybrid Roma Tomatoes (Krishnagiri)
- `AGRI-BATCH-2026-BAN02`: Grand Naine Cavendish Bananas (Theni)
- `AGRI-BATCH-2026-MAN03`: Salem Gundu Mangoes (Salem)
- `AGRI-BATCH-2026-SPN04`: Organic Baby Spinach (Trichy)
- `AGRI-BATCH-2026-BEL05`: Green Bell Peppers (Krishnagiri)

### 2. Registering a New Harvest Batch
1. Click **Register Batch** in the top navigation.
2. Select the registered farmer/FPO from the dropdown.
3. Enter crop commodity, cultivar variety, harvest date, and consignment quantity.
4. Click **Register & Generate QR Tag**.
5. The digital passport is created, anchored on the blockchain adapter, and displayed with an instant dynamic QR code.

### 3. Adding a Traceability Checkpoint
1. On any batch detail page, click **Add Checkpoint**.
2. Select event type (e.g. `COLD_CHAIN_PICKUP`, `DISTRIBUTION_HUB_ARRIVAL`, or `RETAIL_STORE_RECEIPT`).
3. Enter location, actor name, logged temperature (°C), and handling notes.
4. Click **Record Event & Link Hash**.
5. The event is hashed, chained to the previous event's SHA-256 hash, and anchored.

### 4. Consumer QR Verification
1. Click **Verify QR** in the top navigation.
2. Enter a Batch ID (e.g. `AGRI-BATCH-2026-TOM01`) or click any of the demonstration sample shortcuts.
3. View the authenticated provenance, farm GPS coordinates, cold chain custody hops, and AI freshness guide.

### 5. Auditing Hashes on the Ledger Explorer
1. Click **Ledger Explorer** in the top navigation.
2. Paste any 64-character SHA-256 hash from a batch or event.
3. Click **Verify** to confirm cryptographic match, block height, and timestamp.

### 6. Resetting Demonstration Data
```bash
npm run db:reset
```
This resets the SQLite database and re-seeds fresh demonstration records.

---

## Automated Testing & Quality Checks

Run the automated test suite:
```bash
npm test
```

### Verified Test Results:
```text
 ✓ tests/unit/ai-freshness.test.ts (2 tests)
 ✓ tests/unit/blockchain-adapter.test.ts (3 tests)
 ✓ tests/unit/batch-service.test.ts (4 tests)
 ✓ tests/unit/event-service.test.ts (3 tests)
 ✓ tests/integration/api-endpoints.test.ts (8 tests)

 Test Files  5 passed (5)
      Tests  20 passed (20)
```

### Building for Production:
```bash
npm run build
```

---

## Honest Technical Boundaries & Limitations

1. **Garbage In, Garbage Out**: Blockchain technology guarantees that once a record is written, it is tamper-evident and immutable. However, it cannot independently guarantee that the initial physical data entered by a human at the farm gate is physically truthful.
2. **AI Freshness Disclaimer**: The freshness score is a biological degradation model heuristic based on cultivar respiration and thermal logs. It is **not** an accredited microbiological clearance or certified food-safety lab analysis.
3. **Simulated Adapter**: The default configuration runs the `MockBlockchainAdapter`. Hashes are validated against a local SQLite ledger rather than spending public network gas fees.

---

## Roadmap

- [ ] **Phase 1 (Complete)**: Full-stack MVP with SQLite, SHA-256 event chaining, QR generation, and React UI.
- [ ] **Phase 2**: Deploy Solidity smart contract to Polygon Amoy testnet with web3 relayer.
- [ ] **Phase 3**: Train Edge TFLite computer vision model on tomato/banana ripening stages.
- [ ] **Phase 4**: Pilot deployment with partner FPOs in Tamil Nadu.

---

## Team & License

### Project Team (Innovative Design Lab–I)
- **Dharun Vijay M** (Team Leader) — Reg No: `2503412510421063`
- **Bharani R** (Team Member) — Reg No: `2503412510421047`
- **Mithilesh N** (Team Member) — Reg No: `2503412510421159`

### Institution
**Department of Computer Science and Engineering**  
**Sri Sairam Engineering College**  
*(An Autonomous Institution; Affiliated to Anna University, Chennai – 600 044)*

### License
This project is open-source and released under the terms of the [MIT License](./LICENSE).  
`Copyright (c) 2026 AgriPassport Team, Sri Sairam Engineering College`
