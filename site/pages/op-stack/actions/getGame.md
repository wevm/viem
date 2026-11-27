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

### disputeGameFactoryAddress (optional)

- **Type:** `Address`
- **Default:** the portal's `disputeGameFactory()`

The address of the [`DisputeGameFactory` contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/dispute/DisputeGameFactory.sol). Defaults to the factory returned by the portal's `disputeGameFactory()`, which is the factory the portal accepts games from.

If `disputeGameFactoryAddress` and `portalAddress` are both provided, the `targetChain` parameter becomes optional.

```ts
const game = await publicClientL1.getGame({
  l2BlockNumber,
  disputeGameFactoryAddress: '0xe5965Ab5962eDc7477C8520243A95517CD252fA9', // [!code focus]
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
})
```

### l2BlockNumber

- **Type:** `bigint`

The L2 block number.

```ts
const game = await publicClientL1.getGame({ 
  l2BlockNumber: 69420n, // [!code focus]
  targetChain: optimism, 
}) 
```

### limit (optional)

- **Type:** `number`
- **Default:** `100`

Limit of games to extract.

```ts
const game = await publicClientL1.getGame({
  limit: 10, // [!code focus]
  l2BlockNumber,
  targetChain: optimism,
})
```

### portalAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.portal[chainId].address`

The address of the [`Portal` contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal2.sol). Defaults to the `Portal` contract specified on the `targetChain`.

If `disputeGameFactoryAddress` and `portalAddress` are both provided, the `targetChain` parameter becomes optional.

```ts
const game = await publicClientL1.getGame({
  l2BlockNumber,
  disputeGameFactoryAddress: '0xe5965Ab5962eDc7477C8520243A95517CD252fA9',
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed', // [!code focus]
})
```

### strategy (optional)

- **Type:** `'latest' | 'random'`
- **Default:** `'latest'`

Strategy for extracting a dispute game: `latest` returns the latest dispute game, `random` returns a random dispute game.

```ts
const game = await publicClientL1.getGame({
  l2BlockNumber,
  strategy: 'random', // [!code focus]
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
