# Web3 Research — AI-Powered Onchain Research & Token Explorer

A GenLayer-powered Web3 research dApp that analyzes Web3 project websites through an Intelligent Contract and combines verified onchain research with live CoinMarketCap token market data.

## Overview

**Web3 Research** helps users quickly research Web3 projects from a single dashboard.

The application uses a **GenLayer Intelligent Contract** to perform decentralized web research and store the verified research result onchain. After the research result is retrieved, the application automatically opens a **Token Explorer** that displays live market information from CoinMarketCap along with a 30-day token price chart.

The goal is to combine:

- AI-powered Web3 research
- Onchain verification
- Web data analysis
- Live token market information
- A simple and user-friendly interface

## Key Features

### 🧠 AI-Powered Web3 Research

Enter a Web3 project name and website, then send the research request through the GenLayer Intelligent Contract.

The contract:

1. Accesses the project's website.
2. Extracts relevant web information.
3. Uses an LLM to analyze the information.
4. Applies GenLayer's equivalence principle.
5. Stores the verified research result onchain.

### 🔗 GenLayer Intelligent Contract

The research logic runs inside a Python Intelligent Contract.

Deployed contract:

```text
0xd50bD58279aC735DB3c8A7A06579BB5b662Db989
```

Deployment transaction:

```text
0x5350b2e714d83c95f864c2a6bd56e616d47093ba2cff094a2d5284d10adf9a2c
```

The deployment was successfully accepted with:

```text
MAJORITY_AGREE
```

### 🔍 Verified Research Result

After the research transaction completes, users can retrieve the verified result from the Intelligent Contract.

The UI clearly separates the AI research result from the live token market data.

### 🪙 Token Explorer

After **Get Research**, the Token Explorer automatically appears.

It provides live CoinMarketCap data including:

- Token name
- Token symbol
- CoinMarketCap rank
- Current price
- 24-hour price change
- Market capitalization
- 24-hour trading volume

A **Refresh** button allows the user to request the latest market data again.

### 📈 30-Day Price Chart

The Token Explorer also retrieves historical daily market data from CoinMarketCap and displays the latest 30-day price history as an interactive line chart.

The chart includes:

- Daily price points
- Interactive tooltips
- Price formatting
- Responsive layout

## How It Works

```text
User enters Web3 project
        ↓
Research Project
        ↓
GenLayer Intelligent Contract
        ↓
Website analysis + LLM processing
        ↓
Equivalence Principle / Consensus
        ↓
Verified research stored onchain
        ↓
Get Research
        ↓
Token Explorer automatically appears
        ↓
CoinMarketCap live market data
        ↓
30-day price chart
```

## Architecture

```text
                    ┌─────────────────────┐
                    │      Next.js UI     │
                    │   Web3 Research     │
                    └──────────┬──────────┘
                               │
                     Web3 / Contract Call
                               │
                               ▼
                 ┌─────────────────────────┐
                 │ GenLayer Intelligent     │
                 │ Contract                 │
                 │                         │
                 │ • Website Research      │
                 │ • LLM Analysis           │
                 │ • Equivalence Principle │
                 │ • Onchain Storage        │
                 └────────────┬────────────┘
                              │
                              ▼
                    Verified Research
                              │
                              ▼
                 ┌─────────────────────────┐
                 │     Token Explorer      │
                 │                         │
                 │ Next.js API Route       │
                 │        ↓                │
                 │ CoinMarketCap API       │
                 └────────────┬────────────┘
                              │
                              ▼
                   Live Token Market Data
                              │
                              ▼
                       30-Day Chart
```

## Project Structure

```text
genlayer-web3-research/
│
├── contracts/
│   └── web3_research.py
│
├── tests/
│   ├── direct/
│   │   └── test_web3_research.py
│   │
│   └── integration/
│       └── test_web3_research.py
│
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── token/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   └── lib/
│       └── contracts/
│           └── Web3Research.ts
│
├── .gitignore
└── README.md
```

## Technology Stack

### Blockchain / Smart Contracts

- GenLayer
- Python Intelligent Contracts
- GenVM
- GenLayer Studio

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- MetaMask

### Data

- CoinMarketCap API
- GenLayer web rendering
- LLM-powered analysis

### Testing

- pytest
- GenLayer direct mode
- GenLayer integration tests
- GenVM linter

## CMC API Security

The CoinMarketCap API key is **not exposed in the frontend**.

The application uses a server-side Next.js API route:

```text
frontend/app/api/token/route.ts
```

The flow is:

```text
Frontend
   ↓
/api/token?symbol=ASE
   ↓
Next.js Server Route
   ↓
CoinMarketCap API
   ↓
Market Data
   ↓
Frontend
```

The API key is stored in an environment variable and is excluded from Git using `.gitignore`.

No API credentials are included in this repository.

## Requirements

- Node.js
- Python 3.12+
- GenLayer CLI
- GenLayer Studio
- MetaMask
- CoinMarketCap API key for Token Explorer functionality

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/crainx25-stack/genlayer-web3-research.git
cd genlayer-web3-research
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment variables

Create:

```text
frontend/.env.local
```

Add your CoinMarketCap API key:

```env
CMC_API_KEY=YOUR_CMC_API_KEY
```

Do not commit `.env.local` to GitHub.

### 4. Start the frontend

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

## Contract Testing

### Direct Tests

Run:

```bash
pytest tests/direct/ -v
```

Direct tests provide fast feedback without requiring a running Studio environment.

### Integration Tests

Run:

```bash
gltest tests/integration/ -v -s
```

Integration tests verify the contract against GenLayer Studio.

### Contract Linting

Run:

```bash
genvm-lint check contracts/web3_research.py
```

Linting helps detect unsupported imports, nondeterministic behavior, invalid contract patterns, and other Intelligent Contract issues.

## Recommended Demo Flow

For a complete demonstration:

1. Open the Web3 Research dashboard.
2. Enter a Web3 project name.
3. Enter its website.
4. Click **Research Project**.
5. Wait for the GenLayer research transaction.
6. Click **Get Research**.
7. View the verified **AI Research Result**.
8. The **Token Explorer** automatically appears.
9. Review live token metrics.
10. Review the 30-day price chart.
11. Use **Refresh** to retrieve updated market data.

## Builder Program Highlights

This project demonstrates several GenLayer capabilities in one application:

- Intelligent Contract development
- Web access from an Intelligent Contract
- LLM-powered contract logic
- Equivalence-principle based verification
- Onchain research storage
- Next.js integration
- Wallet interaction through MetaMask
- External market-data integration
- Server-side API architecture
- Interactive market-data visualization
- Direct and integration testing

## Deployment

The Intelligent Contract is deployed on the GenLayer Studio network.

### Contract

```text
0xd50bD58279aC735DB3c8A7A06579BB5b662Db989
```

### Deployment Transaction

```text
0x5350b2e714d83c95f864c2a6bd56e616d47093ba2cff094a2d5284d10adf9a2c
```

### Consensus Result

```text
MAJORITY_AGREE
```

## Repository

GitHub:

https://github.com/crainx25-stack/genlayer-web3-research

## Future Improvements

Potential future improvements include:

- Historical ATH / ATL statistics when supported by the CoinMarketCap API plan
- More advanced token analytics
- Multiple token support per project
- Research history and project comparison
- Additional market indicators
- Improved research result formatting
- Production network deployment
- More comprehensive automated testing

## License

This project is licensed under the MIT License.