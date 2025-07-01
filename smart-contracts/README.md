## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
forge test --match-contract ResetTest -vvv --fork-url https://sepolia.infura.io/v3/<YOUR_INFURA_KEY>
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
forge script script/Reset.s.sol:DeployResetAndMailbox \
  --broadcast \
  --verify \
  --rpc-url https://sepolia.infura.io/v3/<YOUR_INFURA_KEY> \
  --private-key <YOUR_PRIVATE_KEY> \
  --verifier etherscan \
  --etherscan-api-key <YOUR_ETHERSCAN_API_KEY>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
