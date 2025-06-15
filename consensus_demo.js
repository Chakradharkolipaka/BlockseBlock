// Consensus Mechanism Simulation: PoW, PoS, DPoS
// Simulates validator selection for each consensus type

// PoW: Select validator with highest power
const powValidators = [
    { name: 'MinerA', power: Math.floor(Math.random() * 100) },
    { name: 'MinerB', power: Math.floor(Math.random() * 100) },
    { name: 'MinerC', power: Math.floor(Math.random() * 100) }
];
const powWinner = powValidators.reduce((a, b) => (a.power > b.power ? a : b));
console.log('PoW Winner:', powWinner);
console.log('PoW: Validator with highest computational power is selected.');

// PoS: Select validator with highest stake
const posValidators = [
    { name: 'StakerA', stake: Math.floor(Math.random() * 100) },
    { name: 'StakerB', stake: Math.floor(Math.random() * 100) },
    { name: 'StakerC', stake: Math.floor(Math.random() * 100) }
];
const posWinner = posValidators.reduce((a, b) => (a.stake > b.stake ? a : b));
console.log('PoS Winner:', posWinner);
console.log('PoS: Validator with highest stake is selected.');

// DPoS: 3 voters vote for delegates
const delegates = ['DelegateA', 'DelegateB', 'DelegateC'];
const votes = [
    delegates[Math.floor(Math.random() * 3)],
    delegates[Math.floor(Math.random() * 3)],
    delegates[Math.floor(Math.random() * 3)]
];
const voteCounts = votes.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
}, {});
const dposWinner = Object.keys(voteCounts).reduce((a, b) => (voteCounts[a] > voteCounts[b] ? a : b));
console.log('DPoS Winner:', dposWinner);
console.log('DPoS: Delegate with most votes is selected by voters.');
