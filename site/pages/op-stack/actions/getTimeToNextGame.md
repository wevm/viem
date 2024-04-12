---
outline: deep
description: Returns the time until the next L2 dispute game is submitted.
---

# getTimeToNextGame

Returns the time until the next L2 dispute game (after the provided block number) is submitted. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.

:::info
This Action is only compatible with OP Stack chains that have upgraded to [Fault Proofs](https://docs.optimism.io/stack/protocol/fault-proofs/overview) and have a deployed [DisputeGameFactoryProxy contract](https://github.com/ethereum-optimism/superchain-registry/blob/main/superchain/extra/addresses/addresses.json).
:::

## Usage

:::code-group

```ts [example.ts]
import { optimism } from 'viem/chains'
import { account, publicClientL1, publicClientL2 } from './config'

const l2BlockNumber = publicClientL2.getBlockNumber()

const { // [!code hl]
  interval, // [!code hl]
  seconds, // [!code hl]
  timestamp // [!code hl]
} = await publicClientL1.getTimeToNextGame({ // [!code hl]
  l2BlockNumber, // [!code hl]
  targetChain: publicClientL2.chain, // [!code hl]
}) // [!code hl]
```

```ts [config.ts]
import { createPublicClient, custom, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { publicActionsL1 } from 'viem/op-stack'

export const publicClientL1 = createPublicClient({
  chain: mainnet,
  transport: http()
}).extend(publicActionsL1())

export const publicClientL2 = createPublicClient({
  chain: optimism,
  transport: custom(window.ethereum)
})
```

:::

## Returns

`{ interval: number, seconds: number, timestamp: number }`

- Estimated `interval` between dispute games – the max time to wait for transaction to be proved.
- Estimated `seconds` until the next dispute game is submitted.
- Estimated `timestamp` of the next dispute game.

## Parameters

### l2BlockNumber

- **Type:** `bigint`

The latest L2 block number.

```ts
const l2BlockNumber = publicClientL2.getBlockNumber() // [!code focus]
const { seconds } = await publicClientL1.getTimeToNextGame({ 
  l2BlockNumber, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const { seconds } = await publicClientL1.getTimeToNextGame({
  l2BlockNumber,
  targetChain: optimism, // [!code focus]
})
```

### disputeGameFactoryAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.disputeGameFactory[chainId].address`

The address of the [`DisputeGameFactory` contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/dispute/DisputeGameFactory.sol). Defaults to the `DisputeGameFactory` contract specified on the `targetChain`.

If a `disputeGameFactoryAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const { seconds } = await publicClientL1.getTimeToNextGame({
  l2BlockNumber,
  disputeGameFactoryAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```

### intervalBuffer (optional)

- **Type:** `number`
- **Default:** `1.1`

The buffer to account for discrepancies between non-deterministic time intervals.

```ts
const { seconds } = await publicClientL1.getTimeToNextGame({ 
  intervalBuffer: 1.2, // [!code focus]
  l2BlockNumber,
  targetChain: optimism, 
}) 
```

### portalAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.portal[chainId].address`

The address of the [`Portal` contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal2.sol). Defaults to the `Portal` contract specified on the `targetChain`.

If a `portalAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const { seconds } = await publicClientL1.getTimeToNextGame({
  l2BlockNumber,
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```