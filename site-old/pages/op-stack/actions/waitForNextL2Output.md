---
outline: deep
description: Waits for the next L2 output (after the provided block number) to be submitted. 
---

# waitForNextL2Output

Waits for the next L2 output (after the provided block number) to be submitted. Used within the [waitToProve](/op-stack/actions/waitToProve) Action.

Internally calls [`getTimeToNextL2Output`](/op-stack/actions/getTimeToNextL2Output) and waits the returned `seconds`.

:::warning
**This Action will be deprecated in the future.**

Use [`waitForNextGame`](/op-stack/actions/waitForNextGame) for OP Stack chains that have upgraded to [Fault Proofs](https://docs.optimism.io/stack/protocol/fault-proofs/overview) and have a deployed [DisputeGameFactoryProxy contract](https://github.com/ethereum-optimism/superchain-registry/blob/main/superchain/extra/addresses/addresses.json).
:::

## Usage

:::code-group

```ts [example.ts]
import { account, publicClientL1, publicClientL2 } from './config'

const l2BlockNumber = await publicClientL2.getBlockNumber()
const output = await publicClientL1.waitForNextL2Output({ // [!code hl]
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
  transport: http()
})
```

:::

## Returns

`WaitForNextL2OutputReturnType`

The L2 output proposal.

## Parameters

### l2BlockNumber

- **Type:** `bigint`

The L2 block number.

```ts
const output = await publicClientL1.waitForNextL2Output({ 
  l2BlockNumber: 69420n, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const output = await publicClientL1.waitForNextL2Output({
  l2BlockNumber,
  targetChain: optimism, // [!code focus]
})
```

### intervalBuffer (optional)

- **Type:** `number`
- **Default:** `1.1`

The buffer to account for discrepancies between non-deterministic time intervals.

```ts
const output = await publicClientL1.waitForNextL2Output({
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
const output = await publicClientL1.waitForNextL2Output({
  l2BlockNumber,
  l2OutputOracleAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```