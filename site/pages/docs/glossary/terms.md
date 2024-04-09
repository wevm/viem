# Terms [Glossary of Terms in viem.]

## Block

A block is a bundled unit of information that include an ordered list of transactions and consensus-related information. Blocks are proposed by proof-of-stake validators, at which point they are shared across the entire peer-to-peer network, where they can easily be independently verified by all other nodes. Consensus rules govern what contents of a block are considered valid, and any invalid blocks are disregarded by the network. The ordering of these blocks and the transactions therein create a deterministic chain of events with the end representing the current state of the network.

## Chain

A Chain refers to a specific blockchain network or protocol that maintains a decentralized, distributed ledger of transactions and other data. Each Chain has its own rules, consensus mechanism, and native cryptocurrency (if any).

Examples of Chains include: Ethereum Mainnet, Polygon, Optimism, Avalanche, Binance Smart Chain, etc.

## EIP-1559 Transaction

EIP-1559 is an Ethereum Improvement Proposal that was implemented in August 2021 as part of the London hard fork. It introduced a new transaction format for Ethereum transactions, which is referred to as an EIP-1559 transaction (aka "transaction type 2").

When a user creates an EIP-1559 transaction, they specify the maximum fee they are willing to pay (`maxFeePerGas`) as well as a tip (`maxPriorityFeePerGas`) to incentivize the miner. The actual fee paid by the user is then determined by the network based on the current demand for block space and the priority of the transaction.

## Event Log

An Event Log is a record of an event emitted by a smart contract. Events are a type of function in a smart contract that can be triggered by specific actions or conditions, and they can be used to notify dapps of changes on the network.

[See more](https://ethereum.org/en/developers/docs/smart-contracts/anatomy/#events-and-logs)

## Filter

In Ethereum, a filter is a mechanism used to query the Ethereum blockchain for specific events or information.

There are three types of filters in Ethereum:

1. Block filters - these filters allow users to monitor the blockchain for new blocks that have been added.

2. Pending Transaction filters - these filters allow users to monitor the blockchain for new pending transactions in the mempool.

3. Event filters - these filters allow users to monitor the blockchain for specific events emitted by smart contracts, such as a token transfer.

When a filter is created, it returns a filter ID, which can be used to retrieve the results of the filter at a later time. Users can then periodically poll the filter for new events or changes that match the filter criteria.

## Human-Readable ABI

Human-Readable ABIs compress JSON ABIs into signatures that are nicer to read and less verbose to write. For more info, check out the [ABIType](https://abitype.dev/api/human) docs.

## Legacy Transaction

A Legacy Transaction in Ethereum refers to a transaction that was created using an older version of Ethereum's transaction format, known as "transaction type 0". This transaction format was used prior to the introduction of the EIP-1559 upgrade, which was implemented in August 2021.

## Non-conforming Log

A non-conforming log is a log where its `topics` & `data` do not match the **indexed** & **non-indexed** arguments on the `event`. `topics` correspond to **indexed** arguments, while `data` corresponds to **non-indexed** arguments.

For example, here is an event definition that has 3 indexed arguments & 1 non-indexed arguments:

```solidity
event Transfer(
  bool indexed foo, 
  uint256 baz, 
  string indexed bar, 
  boolean indexed barry
)
```

A conforming log for the above signature would be:

```ts
const log = {
  ...
  data: '0x
    00...23c346 // ✅ non-indexed argument (baz)
  ',
  topics: [
    '0xdd...23b3ef', // event signature
    '0x00...000001', // ✅ indexed argument (foo)
    '0xae...e1cc58', // ✅ indexed argument (bar)
    '0x00...000000', // ✅ indexed argument (barry)
  ],
  ...
}
```

A non-conforming log for the above signature would be:

```ts
const log = {
  ...
  data: '0x
    00...23c346 // ✅ non-indexed argument (baz)
    00...ae0000 // ❌ indexed argument (bar)
    00...000001 // ❌ indexed argument (barry)
  ',
  topics: [
    '0xdd...23b3ef', // event signature
    '0x00...b92266', // ✅ indexed argument (foo)
  ],
  ...
}
```

A non-conforming log can arise when another contract could be using the same event signature, but with a different number of indexed & non-indexed arguments. For example, the definition for the above log would be:

```solidity
event Transfer(
  bool indexed foo, 
  uint256 baz, 
  string bar, 
  boolean barry
)
```

## Transaction

A transaction is a message sent by an Account requesting to perform an action on the Ethereum blockchain. Transactions can be used to transfer Ether between accounts, execute smart contract code, deploy smart contracts, etc.

## Transaction Receipt

A Transaction Receipt is a record of the result of a specific transaction on the Ethereum blockchain. When a transaction is submitted to the Ethereum network, it is processed by miners and included in a block. Once the block is added to the blockchain, a transaction receipt is generated and stored on the blockchain.

A transaction receipt contains information about the transaction, including:

- The transaction hash: a unique identifier for the transaction.
- The block number and block hash: the block in which the transaction was included.
- The gas used: the amount of gas consumed by the transaction.
- The status of the transaction: "success" if the transaction was executed, otherwise "reverted" if the transaction reverted. 
- The logs generated by the transaction: any log events generated by the smart contract during the transaction execution.

## Transport

A Transport is the intermediary layer that is responsible for executing outgoing requests (ie. RPC requests) in viem.
