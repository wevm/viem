---
outline: deep
description: Retrieves the first L2 output proposal that occurred after a provided block number.
---

# getL2Output

Retrieves the first L2 output proposal that occurred after a provided block number. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.

:::warning
**This Action will be deprecated in the future.**

Use [`getGame`](/op-stack/actions/getGame) for OP Stack chains that have upgraded to [Fault Proofs](https://docs.optimism.io/stack/protocol/fault-proofs/overview) and have a deployed [DisputeGameFactoryProxy contract](https://github.com/ethereum-optimism/superchain-registry/blob/main/superchain/extra/addresses/addresses.json).
:::

## Usage

:::code-group

```ts [example.ts]
import { optimism } from 'viem/chains'
import { account, publicClientL1 } from './config'

const output = await publicClientL1.getL2Output({ // [!code hl]
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

`GetL2OutputReturnType`

The L2 output proposal.

## Parameters

### l2BlockNumber

- **Type:** `bigint`

The L2 block number.

```ts
const output = await publicClientL1.getL2Output({ 
  l2BlockNumber: 69420n, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const output = await publicClientL1.getL2Output({
  l2BlockNumber,
  targetChain: optimism, // [!code focus]
})
```

### l2OutputOracleAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.l2OutputOracle[chainId].address`

The address of the [L2 Output Oracle contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/L2OutputOracle.sol). Defaults to the L2 Output Oracle contract specified on the `targetChain`.

If a `l2OutputOracleAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const output = await publicClientL1.getL2Output({
  l2BlockNumber,
  l2OutputOracleAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```