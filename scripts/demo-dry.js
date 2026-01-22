#!/usr/bin/env node

/**
 * Cronox ParallelPay - Complete Demo
 *
 * Shows the full payment + refund flow like Visa/Mastercard chargebacks:
 * 1. Buyer requests paid service (web scraping)
 * 2. Gets HTTP 402 Payment Required
 * 3. Payment goes to escrow
 * 4. Service attempts delivery
 * 5. Quality check fails (got no data)
 * 6. Refund triggered - money back to buyer
 *
 * This is how ParallelPay protects buyers from bad services.
 */

import { setTimeout as sleep } from 'timers/promises';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
};

// Simulated blockchain state
const escrowState = {
  payments: [],
  refunds: [],
  balance: 0,
};

function banner(text, color = COLORS.cyan) {
  const line = '═'.repeat(62);
  console.log(`\n${color}${COLORS.bright}╔${line}╗${COLORS.reset}`);
  console.log(`${color}${COLORS.bright}║  ${text.padEnd(60)}║${COLORS.reset}`);
  console.log(`${color}${COLORS.bright}╚${line}╝${COLORS.reset}\n`);
}

function section(text) {
  console.log(`\n${COLORS.blue}${COLORS.bright}▶ ${text}${COLORS.reset}`);
  console.log(`${COLORS.dim}${'─'.repeat(60)}${COLORS.reset}`);
}

function log(icon, text, color = COLORS.white) {
  console.log(`  ${icon} ${color}${text}${COLORS.reset}`);
}

function success(text) { log('✓', text, COLORS.green); }
function error(text) { log('✗', text, COLORS.red); }
function info(text) { log('ℹ', text, COLORS.cyan); }
function warn(text) { log('⚠', text, COLORS.yellow); }
function money(text) { log('💰', text, COLORS.green); }
function chain(text) { log('⛓', text, COLORS.magenta); }

function txHash() {
  return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function formatUSDC(amount) {
  return `$${(amount / 1_000_000).toFixed(2)} USDC`;
}

// ============================================================================
// DEMO SCENARIOS
// ============================================================================

async function demoPaymentRequest() {
  section('STEP 1: Buyer Requests Paid Service');

  info('Buyer Agent wants to scrape product data from an e-commerce API');
  info('Sending request to: POST /api/scrape-products');
  await sleep(500);

  console.log(`\n  ${COLORS.yellow}HTTP Request:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}POST /api/scrape-products${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Body: { "url": "https://shop.example.com", "pages": 50 }${COLORS.reset}`);

  await sleep(800);

  console.log(`\n  ${COLORS.red}${COLORS.bright}HTTP 402 Payment Required${COLORS.reset}`);
  console.log(`  ${COLORS.dim}┌──────────────────────────────────────────────────────┐${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}  ${COLORS.cyan}x402 Payment Details:${COLORS.reset}                              ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Amount:      ${COLORS.green}$5.00 USDC${COLORS.reset}                          ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Recipient:   ${COLORS.yellow}0x7B3a...8F2d${COLORS.reset} (Service Provider)    ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Chain:       ${COLORS.magenta}Cronos (338)${COLORS.reset}                        ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Escrow:      ${COLORS.cyan}SLA-backed with refund guarantee${COLORS.reset}     ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    SLA:         ${COLORS.white}99% uptime, <500ms latency${COLORS.reset}          ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└──────────────────────────────────────────────────────┘${COLORS.reset}`);

  return { amount: 5_000_000, recipient: '0x7B3a8F2d', service: 'scrape-products' };
}

async function demoPaymentToEscrow(paymentRequest) {
  section('STEP 2: Payment to Escrow (Like Visa Pre-Auth)');

  info('Buyer Agent signs EIP-3009 authorization');
  await sleep(400);

  console.log(`\n  ${COLORS.cyan}Signing Transaction:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ From:   0xBuyer...1234${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ To:     ParallelPay Escrow Contract${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Amount: ${formatUSDC(paymentRequest.amount)}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└─ Method: transferWithAuthorization (EIP-3009)${COLORS.reset}`);

  await sleep(600);

  const paymentTx = txHash();
  chain(`Transaction submitted: ${paymentTx.slice(0, 18)}...`);

  await sleep(800);

  console.log(`\n  ${COLORS.bgGreen}${COLORS.white}${COLORS.bright} PAYMENT CONFIRMED ${COLORS.reset}`);
  console.log(`  ${COLORS.dim}┌──────────────────────────────────────────────────────┐${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}  ${COLORS.green}Escrow Status:${COLORS.reset}                                     ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Stream ID:    ${COLORS.yellow}#1042${COLORS.reset}                              ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Deposited:    ${COLORS.green}$5.00 USDC${COLORS.reset}                          ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Held in:      ${COLORS.cyan}ParallelPay Escrow${COLORS.reset}                   ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Protection:   ${COLORS.magenta}SLA Refund Guarantee Active${COLORS.reset}        ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Refund Tiers: ${COLORS.white}10% / 25% / 50% / 100%${COLORS.reset}              ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└──────────────────────────────────────────────────────┘${COLORS.reset}`);

  escrowState.payments.push({
    streamId: 1042,
    amount: paymentRequest.amount,
    txHash: paymentTx,
    status: 'escrowed',
  });
  escrowState.balance = paymentRequest.amount;

  success(`Payment escrowed - buyer protected by smart contract`);
  info(`Unlike Visa, refunds are automatic and on-chain!`);

  return { streamId: 1042, txHash: paymentTx };
}

async function demoServiceAttempt() {
  section('STEP 3: Service Attempts Delivery');

  info('Service provider begins web scraping task...');
  await sleep(500);

  console.log(`\n  ${COLORS.cyan}Service Execution:${COLORS.reset}`);

  const steps = [
    ['Connecting to target URL', true],
    ['Authenticating session', true],
    ['Fetching page 1/50', true],
    ['Fetching page 2/50', true],
    ['Fetching page 3/50', false],
  ];

  for (const [step, ok] of steps) {
    await sleep(400);
    if (ok) {
      console.log(`  ${COLORS.green}✓${COLORS.reset} ${step}`);
    } else {
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${step} ${COLORS.red}(CONNECTION REFUSED)${COLORS.reset}`);
    }
  }

  await sleep(300);
  error('Service failed after 3 pages - target site blocked requests');

  console.log(`\n  ${COLORS.bgRed}${COLORS.white}${COLORS.bright} SERVICE DELIVERY FAILED ${COLORS.reset}`);
  console.log(`  ${COLORS.dim}┌──────────────────────────────────────────────────────┐${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}  ${COLORS.red}Failure Report:${COLORS.reset}                                    ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Requested:    50 pages                             ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Delivered:    3 pages (6%)                         ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Error:        ${COLORS.red}Target site blocked scraper${COLORS.reset}          ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    SLA Breach:   ${COLORS.yellow}DELIVERY_FAILURE${COLORS.reset}                    ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└──────────────────────────────────────────────────────┘${COLORS.reset}`);

  return { success: false, delivered: 3, requested: 50, breach: 'DELIVERY_FAILURE' };
}

async function demoQualityCheck(serviceResult) {
  section('STEP 4: Automatic Quality Check (AI Agent)');

  info('ParallelPay AI Agent evaluating service delivery...');
  await sleep(600);

  console.log(`\n  ${COLORS.cyan}Quality Assessment:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Expected: 50 pages of product data${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Received: 3 pages (6% completion)${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Quality:  ${COLORS.red}UNACCEPTABLE${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└─ Decision: ${COLORS.yellow}TRIGGER REFUND${COLORS.reset}`);

  await sleep(500);

  warn('SLA breach detected: Service delivered only 6% of requested data');

  // Calculate refund tier
  const completionRate = (serviceResult.delivered / serviceResult.requested) * 100;
  let refundPercent, tier;

  if (completionRate < 10) {
    refundPercent = 100;
    tier = 'FULL';
  } else if (completionRate < 50) {
    refundPercent = 50;
    tier = 3;
  } else if (completionRate < 80) {
    refundPercent = 25;
    tier = 2;
  } else {
    refundPercent = 10;
    tier = 1;
  }

  console.log(`\n  ${COLORS.bgYellow}${COLORS.white}${COLORS.bright} REFUND DECISION ${COLORS.reset}`);
  console.log(`  ${COLORS.dim}┌──────────────────────────────────────────────────────┐${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}  ${COLORS.yellow}Refund Calculation:${COLORS.reset}                                ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Completion:   ${completionRate.toFixed(0)}%                                   ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Breach Type:  ${COLORS.red}${serviceResult.breach}${COLORS.reset}                  ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Refund Tier:  ${COLORS.yellow}${tier === 'FULL' ? 'FULL REFUND' : `Tier ${tier}`}${COLORS.reset}                            ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}│${COLORS.reset}    Refund Rate:  ${COLORS.green}${refundPercent}%${COLORS.reset}                                   ${COLORS.dim}│${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└──────────────────────────────────────────────────────┘${COLORS.reset}`);

  return { refundPercent, tier, breach: serviceResult.breach };
}

async function demoRefundExecution(escrowInfo, qualityResult) {
  section('STEP 5: On-Chain Refund (Like Visa Chargeback)');

  const refundAmount = (escrowState.balance * qualityResult.refundPercent) / 100;

  info(`Executing ${qualityResult.refundPercent}% refund via RefundManager contract...`);
  await sleep(500);

  console.log(`\n  ${COLORS.magenta}Smart Contract Call:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Contract: RefundManager.sol${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Method:   executeFullRefund()${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Stream:   #${escrowInfo.streamId}${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Reason:   "${qualityResult.breach}"${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└─ Amount:   ${formatUSDC(refundAmount)}${COLORS.reset}`);

  await sleep(800);

  const refundTx = txHash();
  chain(`Refund transaction: ${refundTx.slice(0, 18)}...`);

  await sleep(600);

  console.log(`\n  ${COLORS.dim}Block: #48,291,042 | Gas: 142,500 | Confirmations: 1${COLORS.reset}`);

  await sleep(400);

  console.log(`\n  ${COLORS.bgGreen}${COLORS.white}${COLORS.bright} REFUND SUCCESSFUL ${COLORS.reset}`);
  console.log(`  ${COLORS.dim}╔══════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}  ${COLORS.green}${COLORS.bright}BUYER REFUNDED - FUNDS RETURNED${COLORS.reset}                    ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}╠══════════════════════════════════════════════════════╣${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}                                                      ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}    Original Payment:  ${COLORS.white}${formatUSDC(escrowState.balance)}${COLORS.reset}                      ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}    Refund Amount:     ${COLORS.green}${formatUSDC(refundAmount)}${COLORS.reset}                      ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}    Returned to:       ${COLORS.cyan}0xBuyer...1234${COLORS.reset}                  ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}                                                      ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}    ${COLORS.dim}Transaction:${COLORS.reset}                                      ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}    ${COLORS.yellow}${refundTx.slice(0, 42)}...${COLORS.reset}    ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}                                                      ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}    ${COLORS.dim}View on Explorer:${COLORS.reset}                                  ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}    ${COLORS.cyan}https://explorer.cronos.org/tx/...${COLORS.reset}              ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}║${COLORS.reset}                                                      ${COLORS.dim}║${COLORS.reset}`);
  console.log(`  ${COLORS.dim}╚══════════════════════════════════════════════════════╝${COLORS.reset}`);

  escrowState.refunds.push({
    streamId: escrowInfo.streamId,
    amount: refundAmount,
    txHash: refundTx,
    reason: qualityResult.breach,
  });

  return { refundTx, amount: refundAmount };
}

async function demoComparison() {
  section('STEP 6: ParallelPay vs Traditional Payments');

  console.log(`\n  ${COLORS.cyan}${COLORS.bright}Comparison: Getting a Refund${COLORS.reset}`);
  console.log();

  console.log(`  ${COLORS.red}Traditional (Visa/PayPal):${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ File dispute with bank/PayPal${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Wait 7-14 days for investigation${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Provide evidence manually${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Hope merchant doesn't contest${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ May take 30-90 days total${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└─ ${COLORS.red}No guarantee of refund${COLORS.reset}`);
  console.log();

  console.log(`  ${COLORS.green}ParallelPay (Cronos x402):${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ AI Agent detects SLA breach automatically${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Smart contract verifies breach on-chain${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Refund executes in seconds${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Funds return to buyer wallet instantly${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─ Full transparency on blockchain${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└─ ${COLORS.green}100% guaranteed by smart contract${COLORS.reset}`);

  console.log();
  console.log(`  ${COLORS.bright}Time to refund:${COLORS.reset}`);
  console.log(`    Visa:       ${COLORS.red}30-90 days${COLORS.reset}`);
  console.log(`    ParallelPay: ${COLORS.green}<1 minute${COLORS.reset}`);
}

async function main() {
  console.clear();
  banner('CRONOX PARALLELPAY - REFUND DEMO', COLORS.cyan);

  console.log(`  ${COLORS.dim}Demonstrating automatic refunds for failed services${COLORS.reset}`);
  console.log(`  ${COLORS.dim}Like Visa chargebacks, but instant and on-chain${COLORS.reset}`);
  console.log();
  console.log(`  ${COLORS.cyan}Network:${COLORS.reset}     Cronos Testnet (Chain ID: 338)`);
  console.log(`  ${COLORS.cyan}Protocol:${COLORS.reset}    x402 Payment Required`);
  console.log(`  ${COLORS.cyan}Protection:${COLORS.reset}  SLA-backed Escrow with Refund Guarantee`);

  await sleep(1500);

  // Demo flow
  const paymentRequest = await demoPaymentRequest();
  await sleep(1000);

  const escrowInfo = await demoPaymentToEscrow(paymentRequest);
  await sleep(1000);

  const serviceResult = await demoServiceAttempt();
  await sleep(1000);

  const qualityResult = await demoQualityCheck(serviceResult);
  await sleep(1000);

  const refundResult = await demoRefundExecution(escrowInfo, qualityResult);
  await sleep(1000);

  await demoComparison();

  // Final summary
  banner('DEMO COMPLETE', COLORS.green);

  console.log(`  ${COLORS.bright}Summary:${COLORS.reset}`);
  console.log(`  ${COLORS.dim}├─${COLORS.reset} Buyer paid ${COLORS.yellow}$5.00 USDC${COLORS.reset} for web scraping service`);
  console.log(`  ${COLORS.dim}├─${COLORS.reset} Service failed (only 6% delivered)`);
  console.log(`  ${COLORS.dim}├─${COLORS.reset} AI Agent detected breach automatically`);
  console.log(`  ${COLORS.dim}├─${COLORS.reset} Smart contract executed ${COLORS.green}100% refund${COLORS.reset}`);
  console.log(`  ${COLORS.dim}└─${COLORS.reset} Buyer received ${COLORS.green}$5.00 USDC${COLORS.reset} back in seconds`);
  console.log();
  console.log(`  ${COLORS.cyan}This is the future of payments.${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}Built on Cronos. Powered by x402.${COLORS.reset}`);
  console.log();
}

main().catch(console.error);
