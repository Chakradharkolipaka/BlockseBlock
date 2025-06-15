# Mini Task 1: Simple Blockchain Simulation

This project demonstrates blockchain fundamentals, block structure, and consensus mechanisms using JavaScript. It is divided into three main parts:

## 1. Blockchain Simulation (`blockchain_simulation.js`)
- Simulates a blockchain with 3 linked blocks.
- Demonstrates how tampering with one block affects the entire chain.

## 2. Mining Simulation (`mining_simulation.js`)
- Simulates Proof-of-Work mining by finding a nonce that meets a difficulty condition.
- Shows the computational effort required as difficulty increases.

## 3. Consensus Mechanism Demo (`consensus_demo.js`)
- Simulates and compares PoW, PoS, and DPoS validator selection logic.

## How to Run
1. Install dependencies:
   ```
npm install
   ```
2. Run each simulation:
   ```
node blockchain_simulation.js
node mining_simulation.js
node consensus_demo.js
   ```

## Requirements
- Node.js
- `crypto-js` package (installed via npm)

## Educational Focus
- All code is commented and includes console logs for clarity.
- See each file for detailed explanations and output.
