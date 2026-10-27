# AgriPassport REST API Documentation

This document describes all REST API endpoints provided by the AgriPassport backend server.

**Base URL:** `http://localhost:3001/api`  
**Content-Type:** `application/json`

---

## Standard Response & Error Format

### Success Response
```json
{
  "success": true,
  "count": 5,
  "data": { ... }
}
```

### Validation Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "quantity",
      "message": "Quantity must be greater than zero"
    }
  ]
}
```

### Not Found Response (`404 Not Found`)
```json
{
  "success": false,
  "error": "Batch 'UNKNOWN-ID' not found"
}
```

---

## Endpoints

### 1. System Health Check
- **Route:** `GET /health`
- **Description:** Verifies backend availability and active blockchain adapter mode.
- **Response `200 OK`:**
```json
{
  "status": "ok",
  "project": "AgriPassport",
  "version": "1.0.0",
  "timestamp": "2026-10-27T12:00:00.000Z",
  "blockchain": {
    "mode": "mock",
    "network": "Polygon Amoy Testnet (Simulated Local Adapter)"
  }
}
```

---

### 2. Farmers Directory

#### `GET /farmers`
- **Description:** Retrieves all registered farmers and FPOs.
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "farmerId": "FARM-TN-101",
      "name": "Murugan Palanisamy",
      "fpoName": "Krishnagiri Agri Horticultural FPO",
      "village": "Rayakottai",
      "district": "Krishnagiri",
      "state": "Tamil Nadu",
      "gpsCoordinates": "12.5266, 78.2148",
      "organicCertified": true,
      "contactPlaceholder": "+91-98765-XXXX1",
      "isFictionalDemo": true,
      "createdAt": "2026-10-25T07:15:00.000Z"
    }
  ]
}
```

#### `GET /farmers/:id`
- **Description:** Retrieves a single farmer by ID.
- **Response `200 OK`:** Returns farmer object.
- **Response `404 Not Found`:** `{ "success": false, "error": "Farmer not found" }`

#### `POST /farmers`
- **Description:** Registers a new farmer.
- **Request Body:**
```json
{
  "farmerId": "FARM-TN-105",
  "name": "Arunachalam V",
  "fpoName": "Dindigul Vegetable Growers Consortium",
  "village": "Oddanchatram",
  "district": "Dindigul",
  "state": "Tamil Nadu",
  "gpsCoordinates": "10.4851, 77.7473",
  "organicCertified": true
}
```
- **Response `201 Created`:** Returns created farmer object.

---

### 3. Produce Batches

#### `GET /batches`
- **Description:** Lists produce batches with optional query filters.
- **Query Parameters:**
  - `status` (optional): Filter by lifecycle status (e.g. `IN_TRANSIT`, `RETAIL_READY`)
  - `farmerId` (optional): Filter by farmer ID
  - `search` (optional): Search substring in crop name, batch ID, or farmer name
- **Response `200 OK`:** Returns array of batches.

#### `GET /batches/:id`
- **Description:** Retrieves complete digital passport for a produce batch, including farmer details, events history, QR code Data URL, live AI freshness score, and blockchain anchor status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "batchId": "AGRI-BATCH-2026-TOM01",
    "farmerId": "FARM-TN-101",
    "farmerName": "Murugan Palanisamy",
    "cropName": "Roma Tomatoes (Hybrid)",
    "variety": "AP-TOM-01",
    "harvestDate": "2026-10-25T06:30:00Z",
    "farmLocation": "Rayakottai, Krishnagiri, Tamil Nadu",
    "gpsCoordinates": "12.5266, 78.2148",
    "quantity": 500,
    "unit": "kg",
    "grade": "Grade A",
    "cultivationMethod": "Good Agricultural Practices (GAP) Certified",
    "storageConditions": "12°C - 15°C, 85% RH",
    "initialFreshnessScore": 94.2,
    "estimatedShelfLifeDays": 7,
    "currentStatus": "RETAIL_READY",
    "createdAt": "2026-10-25T07:15:00Z",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "qrCodeSvg": "<svg ...></svg>",
    "currentFreshness": {
      "cropName": "Roma Tomatoes (Hybrid)",
      "freshnessScore": 91.4,
      "grade": "Grade A (Optimal)",
      "estimatedRemainingDays": 6.2,
      "temperatureFactor": "1.25x decay rate (15°C avg)",
      "elapsedHours": 55.4,
      "disclaimer": "DISCLAIMER: This AI freshness score is a heuristic decision-support estimate based on harvest age and temperature logs. It does NOT constitute an accredited food-safety certification or laboratory microbiological clearance."
    },
    "blockchainAnchor": {
      "recordHash": "d3b07384d113edec49eaa6238ad5ff00...",
      "txHash": "0x4b7891fa09391...",
      "blockNumber": 4829105,
      "network": "Polygon Amoy Testnet (Simulated Local Adapter)",
      "isMock": true
    },
    "events": [ ... ]
  }
}
```

#### `POST /batches`
- **Description:** Registers a new harvest batch, mints its passport onto the blockchain adapter, generates a dynamic QR code, and logs the initial `HARVEST_REGISTRATION` event.
- **Request Body:**
```json
{
  "farmerId": "FARM-TN-101",
  "cropName": "Organic Bell Peppers",
  "variety": "Indra F1",
  "harvestDate": "2026-10-27T08:00:00.000Z",
  "quantity": 400,
  "unit": "kg",
  "grade": "Grade A",
  "cultivationMethod": "Polyhouse Cultivation",
  "storageConditions": "8°C - 10°C",
  "initialFreshnessScore": 96.0,
  "estimatedShelfLifeDays": 10
}
```
- **Response `201 Created`:** Returns full `BatchDetailResponse`.

---

### 4. Supply Chain Events

#### `GET /batches/:batchId/events`
- **Description:** Returns chronological custody events for a batch.
- **Response `200 OK`:** Returns array of `TraceabilityEvent`.

#### `POST /events`
- **Description:** Records a new supply chain event, linking it cryptographically to the previous event's SHA-256 hash and updating the batch's current status.
- **Request Body:**
```json
{
  "batchId": "AGRI-BATCH-2026-TOM01",
  "eventType": "COLD_CHAIN_PICKUP",
  "location": "Krishnagiri Cold Hub, Tamil Nadu",
  "actorName": "Ramesh Logistics (TN-24-AQ-8821)",
  "actorRole": "TRANSPORTER",
  "temperatureCelsius": 13.2,
  "humidityPercentage": 85.0,
  "notes": "Loaded into refrigerated reefer truck. Cold chain active."
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "eventId": "EVT-8KJ1-AB32",
    "batchId": "AGRI-BATCH-2026-TOM01",
    "eventType": "COLD_CHAIN_PICKUP",
    "timestamp": "2026-10-27T10:15:00.000Z",
    "location": "Krishnagiri Cold Hub, Tamil Nadu",
    "actorName": "Ramesh Logistics (TN-24-AQ-8821)",
    "actorRole": "TRANSPORTER",
    "temperatureCelsius": 13.2,
    "humidityPercentage": 85.0,
    "notes": "Loaded into refrigerated reefer truck. Cold chain active.",
    "recordHash": "e839120ba8f31920...",
    "previousRecordHash": "a93108ff019284ba...",
    "blockchainTxHash": "0x892a013919b...",
    "isFictionalDemo": true,
    "createdAt": "2026-10-27T10:15:00.000Z"
  }
}
```

---

### 5. Blockchain Anchor Verification

#### `POST /verify-hash`
- **Description:** Verifies whether a 64-character SHA-256 record hash is registered on the ledger.
- **Request Body:**
```json
{
  "recordHash": "e839120ba8f31920..."
}
```
- **Response `200 OK` (Verified):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "recordHash": "e839120ba8f31920...",
    "txHash": "0x892a013919b...",
    "blockNumber": 4829107,
    "anchoredAt": "2026-10-27T10:15:00.000Z",
    "network": "Polygon Amoy Testnet (Simulated Local Adapter)",
    "isMock": true,
    "message": "Cryptographic record hash verified against simulated immutable ledger anchor."
  }
}
```
- **Response `200 OK` (Not Found):**
```json
{
  "success": true,
  "data": {
    "verified": false,
    "recordHash": "0000000000000...",
    "network": "Polygon Amoy Testnet (Simulated Local Adapter)",
    "isMock": true,
    "message": "Record hash not found on the simulated ledger anchor registry."
  }
}
```
