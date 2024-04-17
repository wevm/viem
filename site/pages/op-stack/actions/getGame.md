---
outline: deep
description: Retrieves a valid dispute game on an L2 that occurred after a provided L2 block number.
---

# getGame

Retrieves a valid dispute game on an L2 that occurred after a provided L2 block number. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.

:::info
This Action is only compatible with OP Stack chains that have upgraded to [Fault Proofs](https://docs.optimism.io/stack/protocol/fault-proofs/overview) and have a deployed [DisputeGameFactoryProxy contract](https://github.com/ethereum-optimism/superchain-registry/blob/main/superchain/extra/addresses/addresses.json).
:::

## Usage

:::code-group

```ts [example.ts]
import { optimism } from 'viem/chains'
import { account, publicClientL1 } from './config'

const game = await publicClientL1.getGame({ // [!code hl]
  l2BlockNumber: 69420n, // [!code hl]
  targetChain: optimism, // [!code hl]
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
```

:::

## Returns

`GetGameReturnType`

A valid dispute game.

## Parameters

### l2BlockNumber

- **Type:** `bigint`

The L2 block number.

```ts
const game = await publicClientL1.getGame({ 
  l2BlockNumber: 69420n, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const game = await publicClientL1.getGame({
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
const game = await publicClientL1.getGame({
  l2BlockNumber,
  disputeGameFactoryAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```