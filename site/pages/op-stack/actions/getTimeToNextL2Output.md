---
outline: deep
description: Builds & prepares parameters for a withdrawal to be initiated on an L2.
---

# getTimeToNextL2Output

Returns the time until the next L2 output (after a provided block number) is submitted. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.

:::warning
**This Action will be deprecated in the future.**

Use [`getTimeToNextGame`](/op-stack/actions/getTimeToNextGame) for OP Stack chains that have upgraded to [Fault Proofs](https://docs.optimism.io/stack/protocol/fault-proofs/overview) and have a deployed [DisputeGameFactoryProxy contract](https://github.com/ethereum-optimism/superchain-registry/blob/main/superchain/extra/addresses/addresses.json).
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
} = await publicClientL1.getTimeToNextL2Output({ // [!code hl]
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

- `interval` between L2 outputs – the max time to wait for transaction to be proved.
- Estimated `seconds` until the next L2 Output is submitted.
- Estimated `timestamp` of the next L2 Output.

## Parameters

### l2BlockNumber

- **Type:** `bigint`

The latest L2 block number.

```ts
const l2BlockNumber = publicClientL2.getBlockNumber() // [!code focus]
const { seconds } = await publicClientL1.getTimeToNextL2Output({ 
  l2BlockNumber, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const { seconds } = await publicClientL1.getTimeToNextL2Output({
  l2BlockNumber,
  targetChain: optimism, // [!code focus]
})
```

### intervalBuffer (optional)

- **Type:** `number`
- **Default:** `1.1`

The buffer to account for discrepancies between non-deterministic time intervals.

```ts
const { seconds } = await publicClientL1.getTimeToNextL2Output({ 
  intervalBuffer: 1.2, // [!code focus]
  l2BlockNumber,
  targetChain: optimism, 
}) 
```

### l2OutputOracleAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.l2OutputOracle[chainId].address`

The address of the [L2 Output Oracle contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/L2OutputOracle.sol). Defaults to the L2 Output Oracle contract specified on the `targetChain`.

If a `l2OutputOracleAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const { seconds } = await publicClientL1.getTimeToNextL2Output({
  l2BlockNumber,
  l2OutputOracleAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```