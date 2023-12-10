---
outline: deep
head:
  - - meta
    - property: og:title
      content: getSecondsToNextL2Output
  - - meta
    - name: description
      content: Builds & prepares parameters for a withdrawal to be initiated on an L2.
  - - meta
    - property: og:description
      content: Builds & prepares parameters for a withdrawal to be initiated on an L2.
---

# getSecondsToNextL2Output

Returns the number of seconds until the next L2 Output is submitted. Used for the Withdrawal flow.

## Usage

::: code-group

```ts [example.ts]
import { optimism } from 'viem/chains'
import { account, publicClientL1, publicClientL2 } from './config'

const l2BlockNumber = publicClientL2.getBlockNumber()
const seconds = await publicClientL1.getSecondsToNextL2Output({ // [!code hl]
  l2BlockNumber, // [!code hl]
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

export const publicClientL2 = createPublicClient({
  chain: optimism,
  transport: custom(window.ethereum)
})
```

:::

## Returns

`GetSecondsToNextL2OutputReturnType`

Seconds until next L2 Output.

## Parameters

### l2BlockNumber

- **Type:** `bigint`

The latest L2 block number.

```ts
const l2BlockNumber = publicClientL2.getBlockNumber() // [!code focus]
const seconds = await publicClientL1.getSecondsToNextL2Output({ 
  l2BlockNumber, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const hash = await publicClientL1.getSecondsToNextL2Output({
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
const hash = await publicClientL1.getSecondsToNextL2Output({
  l2BlockNumber,
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```