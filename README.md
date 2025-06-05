# 🚀 Data Ingestion API

A **Node.js + Express** API for asynchronous batch data ingestion with priority-based processing and rate limiting.

---

## ✨ Features

- **POST `/ingest`**  
  Submit IDs with priority (`HIGH` | `MEDIUM` | `LOW`)  
  → IDs are split into batches (max size 3) and queued for processing

- **GET `/status/:ingestion_id`**  
  Check ingestion status & batch progress

- Priority-based batch queue with **rate limiting** (1 batch per 5 seconds)  
- Simple **in-memory storage** (no external DB required)  
- Simulated external fetch with delay to mimic real processing  

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v12+ recommended)  
- npm (Node package manager)

### Installation

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
```

### Run the Server

```bash
node server.js
```

Server listens at: 👉 `http://localhost:5000`

---

## 🔌 API Endpoints

### 1️⃣ POST `/ingest`

Submit ingestion request:

```json
{
  "ids": [1, 2, 3, 4, 5],
  "priority": "HIGH"
}
```

- `ids`: array of integers (1 to 1,000,000,007)  
- `priority`: `"HIGH"`, `"MEDIUM"`, or `"LOW"`

**Response:**

```json
{
  "ingestion_id": "unique-ingestion-id"
}
```

---

### 2️⃣ GET `/status/:ingestion_id`

Get status of an ingestion:

```json
{
  "ingestion_id": "unique-ingestion-id",
  "status": "triggered",
  "batches": [
    {
      "batch_id": "uuid",
      "ids": [1, 2, 3],
      "status": "completed"
    },
    {
      "batch_id": "uuid",
      "ids": [4, 5],
      "status": "triggered"
    }
  ]
}
```

- Batch statuses: `yet_to_start` | `triggered` | `completed`  
- Overall status:  
  - `yet_to_start` (no batch started)  
  - `triggered` (some batches started)  
  - `completed` (all batches done)  

---

## ⚙️ How it Works

- IDs are split into batches of up to 3  
- Batches are queued and processed asynchronously  
- Processing rate limited: **1 batch every 5 seconds**  
- Queue prioritized by priority level & submission time  
- Simulated data fetching with a 1-second delay per batch  
- All data stored in memory — no persistent database  

---

## 🌐 Live Deployment

You can test the API on the live server:
[
👉 **[https://loop-ai-734k.onrender.com/](https://your-deployment-url.com](https://loop-ai-734k.onrender.com/))**  
_(Replace with your actual deployed link, e.g., Render, Vercel, Railway, etc.)_

---

## ✅ Running Tests

Test suite validates key features & edge cases:

```bash
node test.js
```

Tests include:  
- Input validation  
- Priority enforcement  
- Batch size limits  
- Rate limiting  
- Status endpoint accuracy  

---

> Feel free to open issues or pull requests!  
> Happy coding! 🎉
