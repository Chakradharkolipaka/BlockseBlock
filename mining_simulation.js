// Mining Simulation: Proof-of-Work
// Simulates mining a block with a difficulty condition
const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join('0');
        let attempts = 0;
        const start = Date.now();
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            attempts++;
            this.hash = this.calculateHash();
        }
        const end = Date.now();
        console.log(`Block mined: ${this.hash}`);
        console.log(`Attempts: ${attempts}`);
        console.log(`Time taken: ${(end - start) / 1000}s`);
    }
}

// Example usage
const block = new Block(1, Date.now().toString(), { amount: 10 }, '0');
const difficulty = 4; // e.g., hash must start with '0000'
console.log('Mining block...');
block.mineBlock(difficulty);
