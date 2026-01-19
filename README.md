# Cronos ParallelPay

**Agentic, gasless x402 micropayments + streaming payouts with SLA-backed refunds on Cronos.**

Cronos ParallelPay is an AI-native payment infrastructure for the x402 protocol, enabling autonomous agents to buy APIs, data, and services via HTTP 402 with gasless USDC.e payments through the Cronos x402 Facilitator (EIP-3009).

---

## 🎯 Judge Mode (5-Minute Demo)

**Get the full x402 payment flow running in under 5 minutes:**

### Prerequisites
- Node.js 18+ installed
- Cronos Testnet CRO (for gas) - [Get from faucet](https://cronos.org/faucet)
- Cronos Testnet USDC.e (for payments) - [Get from faucet](https://faucet.cronos.org)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/wildhash/cronos.git
cd cronos

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment
cp .env.example .env
# Edit .env and add your PRIVATE_KEY (testnet wallet with CRO + USDC.e)

# 4. Run the complete demo
npm run demo
```

### Expected Output

The demo runs three services and demonstrates the full x402 payment flow:

1. **Seller API** starts on `http://localhost:3001`
2. **Dashboard** starts on `http://localhost:3000`
3. **Buyer Agent** executes the payment flow:
   - ✅ Sends GET request to `/api/premium-data`
   - ✅ Receives HTTP 402 with payment requirements
   - ✅ Signs EIP-3009 authorization (gasless!)
   - ✅ Retries with `X-PAYMENT` header
   - ✅ Seller verifies & settles via Cronos Facilitator
   - ✅ Returns premium data + transaction hash
   - ✅ Dashboard displays the payment receipt

**Look for these key outputs:**
- `[Agent] Received 402 Payment Required` - x402 challenge
- `[Agent] Signing EIP-3009 authorization...` - Payment creation
- `[x402] Payment settled! TxHash: 0x...` - Settlement proof
- Explorer link to view transaction on Cronos Testnet

### Alternative: Step-by-Step Demo

```bash
# Terminal 1 - Start services
npm run demo:watch

# Terminal 2 - Trigger payment (after services are ready)
npm run demo:pay

# View Dashboard
open http://localhost:3000
```

---

## ✅ What's Working Today

### Production Ready
- ✅ **x402 Protocol**: Full HTTP 402 challenge-response flow
- ✅ **Gasless Payments**: EIP-3009 `transferWithAuthorization` - buyers pay no gas
- ✅ **Facilitator Integration**: Verify & settle via Cronos x402 Facilitator
- ✅ **Buyer Agent**: Autonomous agent that detects 402 and handles payment
- ✅ **Seller API**: Express server with x402 middleware
- ✅ **Dashboard**: Real-time payment receipt viewer
- ✅ **Smart Contracts**: SLA-backed streaming with graduated refund tiers
- ✅ **Contract Spec**: JSON Schema for x402 protocol (`contracts/x402.json`)

### Demo Flows
- ✅ Premium data paywall with x402
- ✅ AI inference endpoint with payment
- ✅ Payment verification and settlement
- ✅ On-chain proof of payment

## 🚧 What's Next (WIP)

### In Development
- 🚧 **SLA Monitoring Agent**: Continuous endpoint sampling for latency/uptime
- 🚧 **Automated Refund Triggers**: Smart contract refunds on SLA breach
- 🚧 **Multi-tier Breach Detection**: 10%/25%/50% graduated refunds
- 🚧 **Real-time SLA Dashboard**: Live metrics visualization
- 🚧 **Agent Oracle Integration**: Off-chain metrics → on-chain validation

### Planned Features
- 📋 Streaming payment flows (pay-per-second)
- 📋 Multi-token support (USDC, USDT, etc.)
- 📋 Cross-chain facilitator support

---

## 📊 SLA Scenario: API Latency Guarantee

### The Promise
A data provider offers a **Premium Real-Time Market Data API** with strict SLA guarantees:

- **Latency**: <200ms p95 response time
- **Uptime**: 99.9% availability
- **Error Rate**: <0.5% failed requests

Cost: **0.10 USDC.e per call** or **$100/month subscription**

### The Guarantee (Graduated Refunds)

| Breach Level | Condition | Refund | Example |
|--------------|-----------|---------|---------|
| **Minor** | p95 latency >200ms for 5 minutes | 10% | 5 min breach = $0.01 refund per call |
| **Moderate** | Daily uptime <99.5% | 25% | 99.0% uptime = $25 monthly refund |
| **Severe** | Uptime <99% OR p99 >500ms | 50% | 98% uptime = $50 monthly refund |
| **Critical** | 3+ severe breaches in 24h | 100% + auto-cancel | Full refund + stream stops |

### How It Works

1. **Stream Creation**: Buyer creates SLA-backed payment stream
   ```typescript
   const slaConfig = {
     maxLatencyMs: 200,        // p95 threshold
     minUptimePercent: 9990,   // 99.90% minimum
     maxErrorRate: 50,         // 0.50% max errors
     refundTier1: 1000,        // 10% refund (minor)
     refundTier2: 2500,        // 25% refund (moderate)
     refundTier3: 5000,        // 50% refund (severe)
     autoStopOnSevereBreach: true
   };
   ```

2. **Monitoring**: Agent Oracle samples the API every 10 seconds
   - Records response times
   - Tracks success/failure rates
   - Calculates rolling p95/p99 metrics

3. **Breach Detection**: When SLA is violated:
   - Agent Oracle submits signed breach report to `AgentOracle.sol`
   - Smart contract validates the report
   - `RefundManager.sol` calculates refund amount based on breach tier
   - Funds are automatically released to buyer

4. **Auto-Stop**: On critical breach (3+ severe in 24h):
   - Stream is automatically paused
   - Remaining funds returned to buyer
   - Seller must acknowledge and fix issues before resuming

### Real-World Example

**Day 1-5**: API performs perfectly (p95 = 150ms, uptime = 100%)
- Buyer pays 500 calls × $0.10 = **$50**
- No refunds

**Day 6**: Database slowdown causes latency spike
- p95 jumps to 350ms for 30 minutes
- Breach detected → **25% refund** = $12.50 back to buyer
- Provider gets alert and fixes database

**Day 7-30**: Performance restored, no further issues
- Final cost: $50.00 initial - $12.50 refund = **$37.50 net cost**
- Buyer got exactly what they paid for: good service most of the time, automatic refund when SLA broke

---

## What Makes This Different

- **x402 Native**: Full HTTP 402 payment flow with Cronos x402 Facilitator integration
- **Gasless Payments**: Buyers pay with USDC.e using EIP-3009 `transferWithAuthorization` - no gas needed
- **SLA-Backed Streams**: Continuous payment flows with automatic refunds when service guarantees are broken
- **Agent-First Design**: Built for AI agents to autonomously pay for and consume services
- **Graduated Refunds**: Tiered refund system based on breach severity (10%/25%/50%)

## Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  CRONOS x402 FLOW                    │
                    └─────────────────────────────────────────────────────┘

   ┌─────────────┐         1. GET /api/data          ┌─────────────────────┐
   │             │ ────────────────────────────────▶ │                     │
   │  BUYER      │                                   │   SELLER API        │
   │  AGENT      │ ◀──── 2. HTTP 402 + Requirements  │   (x402 Server)     │
   │             │                                   │                     │
   │  (AI/CLI)   │         3. X-PAYMENT header       │   /api/premium-data │
   │             │ ────────────────────────────────▶ │   /api/ai-inference │
   └─────────────┘                                   └──────────┬──────────┘
         │                                                      │
         │                                                      │
         │ EIP-3009                               4. /verify    │
         │ Authorization                          5. /settle    │
         │                                                      │
         ▼                                                      ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                     CRONOS x402 FACILITATOR                         │
   │                                                                     │
   │  • Verifies EIP-3009 signatures                                     │
   │  • Settles USDC.e payments (gasless for buyer)                      │
   │  • Returns txHash for proof                                         │
   └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Settlement
                                    ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                         CRONOS EVM                                  │
   │                                                                     │
   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
   │  │ SLAStreamFactory │  │  RefundManager   │  │   AgentOracle    │  │
   │  │                  │  │                  │  │                  │  │
   │  │ • Create streams │  │ • Partial refund │  │ • Submit metrics │  │
   │  │ • SLA config     │  │ • Full refund    │  │ • Breach detect  │  │
   │  │ • Auto-stop      │  │ • Graduated tier │  │ • Signed reports │  │
   │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
   │                                                                     │
   │  USDC.e: 0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0 (testnet)      │
   └─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

1. Get testnet CRO from [Cronos Faucet](https://cronos.org/faucet)
2. Get testnet USDC.e from [USDC.e Faucet](https://faucet.cronos.org)

### Installation

```bash
# Clone the repository
git clone https://github.com/wildhash/cronos.git
cd cronos

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your private key
```

### Deploy Contracts

```bash
# Deploy to Cronos Testnet
npm run deploy:cronos-testnet

# Or deploy to Cronos Mainnet
npm run deploy:cronos
```

### Run the x402 Demo

**Terminal 1 - Start the Seller API:**
```bash
npm run seller-api
# Server running on http://localhost:3001
```

**Terminal 2 - Run the Buyer Agent:**
```bash
npm run buyer-agent
# Agent will: 1) Get 402, 2) Sign payment, 3) Receive data
```

**Terminal 3 - View Dashboard:**
```bash
npm run dashboard
# Open http://localhost:3000
```

## Core Components

### 1. Seller API (`apps/seller-api`)

x402-compliant Express server that:
- Returns HTTP 402 with payment requirements when unauthorized
- Accepts `X-PAYMENT` header with EIP-3009 authorization
- Calls Cronos x402 Facilitator to verify and settle payments
- Serves premium content after successful payment

```typescript
// Example x402 response
HTTP/1.1 402 Payment Required
X-Payment-Required: true
Content-Type: application/json

{
  "paymentRequired": true,
  "amount": "100000",           // 0.10 USDC.e (6 decimals)
  "currency": "USDC.e",
  "recipient": "0x...",
  "chainId": 338,
  "facilitatorUrl": "https://facilitator.cronoslabs.org/v2/x402"
}
```

### 2. Buyer Agent (`apps/buyer-agent`)

Autonomous agent that:
- Detects HTTP 402 responses
- Generates EIP-3009 `transferWithAuthorization` signatures
- Submits payment via `X-PAYMENT` header
- Processes received data

```typescript
// EIP-3009 Authorization (gasless!)
const authorization = await generateEIP3009Authorization({
  token: USDC_ADDRESS,
  from: buyerAddress,
  to: sellerAddress,
  value: amount,
  validAfter: 0,
  validBefore: deadline,
  nonce: randomNonce
});
```

### 3. Smart Contracts

| Contract | Purpose |
|----------|---------|
| **SLAStreamFactory** | Create streams with SLA guarantees and graduated refund tiers |
| **RefundManager** | Execute partial/full refunds based on breach severity |
| **AgentOracle** | Receive and validate SLA metrics from authorized agents |
| **X402Payment** | On-chain payment requests with refund policies |
| **ParallelPay** | Base streaming contract with parallel execution support |

### 4. SLA-Backed Streaming

Create streams with automatic refund guarantees:

```typescript
const slaConfig = {
  maxLatencyMs: 200,           // Max 200ms response time
  minUptimePercent: 9950,      // 99.50% uptime required
  maxErrorRate: 50,            // Max 0.50% error rate
  maxJitterMs: 50,             // Max 50ms jitter
  refundPercentOnBreach: 1000, // 10% refund per breach
  autoStopOnSevereBreach: true // Auto-cancel on 3+ breaches
};

// Graduated refund tiers
// Tier 1: 10% refund (minor breach)
// Tier 2: 25% refund (moderate breach)
// Tier 3: 50% refund (severe breach)
```

## 📋 x402 Contract Specification

The x402 payment protocol is formally specified in [`contracts/x402.json`](contracts/x402.json) as a JSON Schema (v1.0.0).

### 402 Payment Required Response

When a client requests a protected resource without payment, the server returns:

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
X-Payment-Required: true
```

```json
{
  "paymentRequired": true,
  "amount": "100000",
  "currency": "USDC.e",
  "recipient": "0x1234567890123456789012345678901234567890",
  "chainId": 338,
  "token": "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0",
  "facilitatorUrl": "https://facilitator.cronoslabs.org/v2/x402",
  "description": "Premium market data access",
  "network": "Cronos Testnet"
}
```

### X-PAYMENT Header Format

The client retries the request with an `X-PAYMENT` header containing base64-encoded JSON:

```http
GET /api/premium-data HTTP/1.1
X-PAYMENT: eyJ0eXBlIjoiZWlwMzAwOSIsImNoYWluSWQiOjMzOCwidG9rZW4iOi...
```

Decoded payload (EIP-3009 authorization):

```json
{
  "type": "eip3009",
  "chainId": 338,
  "token": "0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0",
  "from": "0x9876543210987654321098765432109876543210",
  "to": "0x1234567890123456789012345678901234567890",
  "value": "100000",
  "validAfter": 0,
  "validBefore": 1737374400,
  "nonce": "0x1234567890abcdef...",
  "v": 27,
  "r": "0xabcdef...",
  "s": "0x123456..."
}
```

### Schema Validation

The seller API validates all 402 responses against the schema to ensure compliance. See [`contracts/x402.json`](contracts/x402.json) for the complete specification including all required/optional fields and validation rules.

## Network Configuration

### Cronos Testnet
- **Chain ID**: 338
- **RPC**: `https://evm-t3.cronos.org`
- **Explorer**: `https://explorer.cronos.org/testnet`
- **USDC.e**: `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0`
- **Faucet**: https://faucet.cronos.org

### Cronos Mainnet
- **Chain ID**: 25
- **RPC**: `https://evm.cronos.org`
- **Explorer**: `https://explorer.cronos.org`
- **USDC.e**: `0xc21223249CA28397B4B6541dfFaEcC539BfF0c59`

### x402 Facilitator
- **URL**: `https://facilitator.cronoslabs.org/v2/x402`
- **Endpoints**: `/verify`, `/settle`, `/supported`

## API Reference

### Seller API Endpoints

```
GET  /api/premium-data      - Premium data endpoint (requires x402 payment)
GET  /api/ai-inference      - AI inference endpoint (requires x402 payment)
GET  /api/health            - Health check
GET  /api/pricing           - View pricing information
POST /api/streams           - Create SLA-backed stream
GET  /api/streams/:id       - Get stream details
```

### Dashboard Endpoints

```
GET  /api/info              - Deployment information
GET  /api/streams/:count    - List recent streams
GET  /api/stream/:id        - Get specific stream details
GET  /api/payments          - List x402 payments
GET  /api/refunds           - List refund events
```

## Agent SDK

Full-featured SDK for building x402-compatible agents:

```typescript
import { SLAMonitor, RefundExecutor, X402Client } from './agent-sdk';

// Initialize x402 client
const x402 = new X402Client({
  facilitatorUrl: 'https://facilitator.cronoslabs.org/v2/x402',
  signer: wallet
});

// Make x402 payment
const result = await x402.payForResource({
  url: 'https://api.example.com/premium-data',
  amount: '100000', // 0.10 USDC.e
});

// Initialize SLA monitor
const monitor = new SLAMonitor(oracleAddress, streamFactoryAddress, signer);
monitor.addStream(streamId);
monitor.startMonitoring(10000); // Check every 10s

// Listen for breaches and auto-refund
monitor.on('breach', async (event) => {
  const refundExecutor = new RefundExecutor(refundManagerAddress, signer);
  await refundExecutor.executePartialRefund({
    streamId: event.streamId,
    breachType: event.breachType,
    breachValue: event.breachValue
  });
});
```

## Demo Flows

### Flow A: Basic x402 Paywall

```bash
# 1. Buyer requests resource
curl http://localhost:3001/api/premium-data
# Returns: 402 Payment Required

# 2. Buyer pays and retries
curl -H "X-PAYMENT: <eip3009-auth>" http://localhost:3001/api/premium-data
# Returns: { "data": "premium content", "txHash": "0x..." }
```

### Flow B: Streaming with SLA

```bash
# 1. Create stream with SLA config
npm run create-stream -- --recipient 0x... --amount 1000000 --sla strict

# 2. Monitor metrics
npm run monitor-stream -- --streamId 1

# 3. Simulate breach and auto-refund
npm run simulate-degradation
```

### Flow C: Full Agent Workflow

```bash
# Run complete autonomous agent demo
npm run agent-demo

# This will:
# 1. Deploy fresh contracts
# 2. Create SLA-backed stream
# 3. Monitor service metrics
# 4. Detect breach and execute refund
# 5. Log everything to dashboard
```

## Scripts

```bash
npm run compile              # Compile Solidity contracts
npm run deploy:cronos-testnet # Deploy to Cronos testnet
npm run deploy:cronos        # Deploy to Cronos mainnet

npm run seller-api           # Start x402 seller server
npm run buyer-agent          # Run autonomous buyer agent
npm run dashboard            # Start dashboard UI

npm run stress-parallel      # Run parallel execution benchmark
npm run simulate-degradation # Simulate SLA breach and refund

npm run test                 # Run full test suite
npm run test-hardhat         # Run Hardhat tests only
```

## Use Cases

1. **API Monetization**: Pay-per-call APIs with automatic refunds on downtime
2. **AI Agent Services**: Agents buying compute, data, or inference with SLA guarantees
3. **Data Streaming**: Real-time feeds with latency guarantees
4. **CDN Services**: Content delivery with availability SLAs
5. **Cloud Infrastructure**: Pay-per-use compute with uptime guarantees

## Hackathon Submission

**Cronos x402 Paytech Hackathon** - January 2026

### Tracks
- [x] Main Track: x402 Applications
- [x] x402 Agentic Finance Track
- [x] Crypto.com Ecosystem Integration
- [x] Dev Tooling Track

### What We Built
1. **Full x402 Integration**: Seller API + Buyer Agent with Cronos Facilitator
2. **SLA-Backed Streaming**: Automatic refunds on service degradation
3. **Graduated Refund Tiers**: 10%/25%/50% based on breach severity
4. **Real-time Dashboard**: Live payment and SLA monitoring
5. **Agent SDK**: Full toolkit for building x402-compatible agents

## Resources

- [Cronos x402 Facilitator Docs](https://docs.cronos.org/cronos-x402-facilitator/introduction)
- [Quick Start for Sellers](https://docs.cronos.org/cronos-x402-facilitator/quick-start-for-sellers)
- [Quick Start for Buyers](https://docs.cronos.org/cronos-x402-facilitator/quick-start-for-buyers)
- [Cronos EVM Docs](https://docs.cronos.org)
- [Crypto.com AI Agent SDK](https://ai-agent-sdk-docs.crypto.com/)

## 🔧 Troubleshooting

### Installation Issues

**Problem**: `npm install` fails with dependency conflicts
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

**Problem**: `Cannot find package 'solc'`
```bash
# Solution: Dependencies not installed
npm install --legacy-peer-deps
```

### Demo Issues

**Problem**: `PRIVATE_KEY` environment variable error
```bash
# Solution: Configure .env file
cp .env.example .env
# Edit .env and add your testnet private key
```

**Problem**: Seller API not starting / "Address already in use"
```bash
# Solution: Port 3001 is occupied
lsof -ti:3001 | xargs kill -9  # Kill process on port 3001
npm run seller-api
```

**Problem**: Dashboard not starting / "Address already in use"
```bash
# Solution: Port 3000 is occupied
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
npm run dashboard
```

### Payment Issues

**Problem**: "Insufficient funds" error
```bash
# Solution: Get testnet tokens
# 1. CRO (for gas): https://cronos.org/faucet
# 2. USDC.e (for payments): https://faucet.cronos.org
```

**Problem**: Payment verification failed
```bash
# Solution: Check your wallet has USDC.e
# The buyer wallet needs USDC.e tokens (not just CRO)
# Get USDC.e from: https://faucet.cronos.org
```

**Problem**: "Facilitator unreachable" error
```bash
# Solution: Check network connectivity
# Ensure you can reach: https://facilitator.cronoslabs.org/v2/x402
curl https://facilitator.cronoslabs.org/v2/x402/supported
```

**Problem**: ChainId mismatch
```bash
# Solution: Verify you're on Cronos Testnet (338)
# Check your RPC URL in .env:
CRONOS_TESTNET_RPC_URL=https://evm-t3.cronos.org
```

### Contract Deployment Issues

**Problem**: Deployment fails with "insufficient funds"
```bash
# Solution: Your wallet needs CRO for gas
# Get testnet CRO from: https://cronos.org/faucet
```

**Problem**: "Cannot connect to network"
```bash
# Solution: Check RPC URL in .env
CRONOS_TESTNET_RPC_URL=https://evm-t3.cronos.org
```

### Reset / Clean State

**Problem**: Want to start fresh
```bash
# Stop all services
pkill -f "seller-api"
pkill -f "dashboard"

# Clean deployed contracts (optional)
rm -rf deployments/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Problem**: Test failures
```bash
# Clean and rebuild
npm run compile
npm test
```

## Security

- Checks-effects-interactions pattern
- Reentrancy guards on all external calls
- EIP-3009 signature verification
- Access control on sensitive operations
- Custom errors for gas efficiency

## License

ISC

---

**Built for Cronos x402** | Gasless Agentic Payments | SLA-Backed Streams | Automatic Refunds
