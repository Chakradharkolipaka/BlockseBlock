# Blockchain Platform Comparison

| **Blockchain Name**   | **Type**      | **Consensus Mechanism**   | **Permission Model** | **Speed / Throughput (TPS)** | **Smart Contract Support**      | **Token Support**                | **Typical Use Case**                | **Notable Technical Feature**         |
|---------------------- |-------------- |--------------------------|---------------------|------------------------------|----------------------------------|------------------------------------|--------------------------------------|---------------------------------------|
| Ethereum              | Public        | Proof of Stake (PoS)     | Open                | ~30                         | Yes (Solidity, Vyper)            | Native (ETH)                      | Decentralized apps, DeFi             | Turing-complete smart contracts       |
| Hyperledger Fabric    | Private       | Pluggable (e.g., Raft, Kafka, Solo) | Permissioned         | 1,000+                      | Yes (Go, Java, Node.js)           | No native token                    | Enterprise, supply chain, asset tracking | Modular architecture, private channels |
| Quorum                | Consortium    | Istanbul BFT, Raft       | Permissioned        | 100+                        | Yes (Solidity)                   | Native (ETH, private tokens)       | Inter-bank, finance, consortia        | Privacy via private transactions      |

---

**Legend:**
- **Type:** Public = open to all, Private = restricted to one organization, Consortium = controlled by a group.
- **Consensus Mechanism:** How agreement is reached on the network.
- **Permission Model:** Who can participate in the network.
- **Speed / Throughput:** Transactions per second (approximate, varies by setup).
- **Smart Contract Support:** Whether programmable contracts are supported and in which languages.
- **Token Support:** Whether the platform has a native or custom token system.
- **Typical Use Case:** Common real-world applications.
- **Notable Technical Feature:** Unique or advanced technical capability.
