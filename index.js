const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// Solana Connection Setup
const connection = new Connection("https://api.mainnet-beta.solana.com");
const bot = new TelegramBot('YOUR_BOT_API_KEY', { polling: true });

const portfolio = require('./portfolio.json');
const alerts = require('./alerts.json');

// Function to fetch memecoin price
async function getPrice(coinAddress) {
  const response = await axios.get(`https://api.example.com/price?address=${coinAddress}`);
  return response.data.price;
}

// Function to send alerts
function sendAlert(message) {
  bot.sendMessage('YOUR_CHAT_ID', message);
}

// Portfolio tracking
async function trackPortfolio() {
  let totalValue = 0;
  for (let coin of portfolio) {
    const price = await getPrice(coin.coinAddress);
    totalValue += price * coin.amount;
  }
  console.log(`Total Portfolio Value: $${totalValue.toFixed(2)}`);
}

// Price alerts
async function checkAlerts() {
  for (let alert of alerts) {
    const price = await getPrice(alert.coinAddress);
    if (price >= alert.targetPrice) {
      sendAlert(`Price Alert! ${alert.coinAddress} has reached $${price}`);
    }
  }
}

// Transaction logging
async function logTransactions(coinAddress) {
  const pubKey = new PublicKey(coinAddress);
  const signatures = await connection.getConfirmedSignaturesForAddress2(pubKey);
  const transactions = signatures.map(sig => ({
    signature: sig.signature,
    timestamp: new Date(sig.blockTime * 1000).toLocaleString()
  }));
  fs.writeFileSync('transactions.json', JSON.stringify(transactions, null, 2));
}

// Main function
async function main() {
  await trackPortfolio();
  await checkAlerts();
  await logTransactions('MEMECOIN_ADDRESS');
}

main();
setInterval(main, 60000); // Run every minute
