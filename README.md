# Phone Number Intelligence Tool

A web application for validating phone numbers and assessing their scam/fraud risk. Supports single lookups and bulk batch processing via file upload. Deployed as a serverless app on Netlify.

---

## Features

- **Phone Validation** — checks if a number is active, identifies carrier, line type (mobile/landline/VOIP), and location
- **Fraud Risk Scoring** — returns a 0–100 fraud score powered by IPQualityScore, with risk level classification (Low / Moderate / High / Critical)
- **Signal Breakdown** — displays individual risk signals: spammer status, recent abuse, leaked data, TCPA blacklist, do-not-call registry, prepaid, and VOIP flags
- **Batch Processing** — manually enter up to 10 numbers, or upload a `.txt` file for large-scale lookups
- **Webhook API** — external systems can query number health via a secured POST endpoint
- **Serverless** — no Express server to manage; all backend logic runs as Netlify Functions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Create React App |
| Backend | Netlify Functions (serverless) |
| HTTP Client | Axios |
| Hosting | Netlify |
| Phone Validation | [NumVerify API](https://numverify.com) |
| Fraud/Risk Data | [IPQualityScore API](https://www.ipqualityscore.com) |

---

## Getting Started

### Prerequisites

- Node.js v16+
- npm
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm install -g netlify-cli`)
- A [NumVerify](https://numverify.com) API key
- An [IPQualityScore](https://www.ipqualityscore.com) API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root (`my-app/`):
   ```env
   VERIFY_API_KEY=your_numverify_api_key
   VERIFY_API_URL=http://apilayer.net/api/validate

   IPQS_API_KEY=your_ipqualityscore_api_key
   IPQS_API_URL=https://www.ipqualityscore.com/api/json/phone

   WEBHOOK_SECRET=your_webhook_api_key
   ```

---

## Running Locally

A single command starts both the frontend and serverless functions:

```bash
netlify dev
```

The app opens at `http://localhost:8888`.

---

## Deployment

The app deploys automatically to Netlify when changes are pushed to `main`.

**Required:** Add all environment variables (`VERIFY_API_KEY`, `VERIFY_API_URL`, `IPQS_API_KEY`, `IPQS_API_URL`, `WEBHOOK_SECRET`) in the Netlify dashboard under Site settings → Environment variables.

Live URL: https://numberhealth.netlify.app

---

## Usage

### Single / Manual Lookup
Enter a 10-digit US phone number in the input field and click **Check Number**. Use **+ Add another number** to check up to 10 numbers at once.

### Batch Lookup via File Upload
Click **Upload .txt file** and select a plain text file containing phone numbers — one per line or comma-separated. The app will parse all valid 10-digit numbers from the file and process them as a batch.

Example `.txt` format:
```
7545551234
(305) 555-9876
8005554321, 9545557890
```

### Results
Each number returns:
- **Active / Inactive** status
- **Line Type**, **Carrier**, **Location**
- **Fraud Score** (0–100) with a visual bar and risk label
- **Risk Flags** — highlighted pills for any active signals
- **Signal Breakdown** — full Yes/No grid of all risk indicators

---

## Webhook API

External systems can query number health via a secured POST endpoint.

**Endpoint:**
```
POST /.netlify/functions/webhook-number-health
```

**Headers:**
| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `x-api-key` | Your `WEBHOOK_SECRET` value |

**Request body:**
```json
{
  "phoneNumber": "7542457499"
}
```

**Example (curl):**
```bash
curl -X POST https://numberhealth.netlify.app/.netlify/functions/webhook-number-health \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{"phoneNumber": "7542457499"}'
```

---

## Project Structure

```
my-app/
├── public/
├── src/
│   ├── App.js            # Input page, batch logic, file upload
│   ├── App.css
│   ├── ResultsPage.js    # Results display, score bar, risk flags
│   ├── ResultsPage.css
│   ├── api.js            # Frontend fetch wrappers
│   └── index.js
├── netlify/
│   └── functions/
│       ├── validate-phone.js          # Phone validation (NumVerify)
│       ├── scam-risk.js               # Fraud scoring (IPQualityScore)
│       └── webhook-number-health.js   # Webhook combining both APIs
├── netlify.toml           # Netlify build & function config
└── .env                   # API keys (not committed)
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VERIFY_API_KEY` | NumVerify API key |
| `VERIFY_API_URL` | NumVerify endpoint |
| `IPQS_API_KEY` | IPQualityScore API key |
| `IPQS_API_URL` | IPQualityScore phone endpoint |
| `WEBHOOK_SECRET` | API key for authenticating webhook requests |

> **Never commit your `.env` file.** It is included in `.gitignore`.

---

## License

This project is for private/internal use. No license is currently applied.
