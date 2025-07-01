
# Reset

**This project was created for the Ethereum NS Hackathon by [@UrosZigic](https://github.com/uroszigic) and [@aieksa00](https://github.com/aieksa00).**

<p align="center">
  <img src="./assets/logo.png" alt="Reset Logo" width="200"/>
</p>

**Reset** is a Web3 protocol for post‑hack negotiations between a hacked protocol and hackers.  
_“If you want to negotiate with hackers, they need to feel safe.”_

---

## 🚀 Overview

When a smart contract protocol is hacked, hackers are often willing to return a portion of the funds in exchange for the protocol not taking any legal action — but there is no safe, private, and trustless channel to negotiate.  
**Reset** fills that gap by enabling on‑chain negotiations and private communication between involved parties.

---

## 🧩 Components

| Component      | Description                                         | Location            |
| -------------- | --------------------------------------------------- | ------------------- |
| 🔨 Smart Contracts | Solidity smart contracts, tests & scripts            | `/smart-contracts`          |
| 🌐 Frontend    | React dApp UI for easier use                         | `/frontend`         |
| 📊 Subgraph    | The Graph for indexing events & quering data         | `/subgraph`         |

---

## 🛣️ Future Improvements

To make Reset more flexible and production-ready, the following enhancements could be considered:

- **Multi-token support**  
  Enable negotiations and refunds using any ERC-20 token or native ETH, removing current WETH-only limitation.

- **Protocol Representative Trustless Auth**  
  Remove the need for manual verification of protocol representatives by introducing:
  - DAO/multisig governance recognition  
  - ENS-based identity mapping

- **In-house indexer**  
By developing an in-house indexer for our EventEmitter, we will achieve cheaper and faster data fetching.

---

## 📚 Quick Start

1. **Clone this repo**  
   ```bash
   git clone https://github.com/aieksa00/reset.git
   cd reset
