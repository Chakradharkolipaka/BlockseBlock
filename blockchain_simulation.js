// Mini Blockchain Simulation
// Simulates a blockchain with 3 linked blocks and demonstrates tampering effect
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
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, Date.now().toString(), 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.calculateHash()) return false;
            if (currentBlock.previousHash !== prevBlock.hash) return false;
        }
        return true;
    }
}

// Create blockchain and add 3 blocks
let miniChain = new Blockchain();
miniChain.addBlock(new Block(1, Date.now().toString(), { amount: 4 }));
miniChain.addBlock(new Block(2, Date.now().toString(), { amount: 8 }));

console.log('Original chain:');
console.log(JSON.stringify(miniChain, null, 2));
console.log('Is chain valid?', miniChain.isChainValid());

// Tamper with Block 1
debugger;
miniChain.chain[1].data = { amount: 100 };
miniChain.chain[1].hash = miniChain.chain[1].calculateHash();

console.log('\nAfter tampering with Block 1:');
console.log(JSON.stringify(miniChain, null, 2));
console.log('Is chain valid?', miniChain.isChainValid());
