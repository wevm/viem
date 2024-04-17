---
outline: deep
description: Gets time until the L2 withdrawal transaction is ready to be proved.
---

# getTimeToProve

Gets time until the L2 withdrawal transaction is ready to be proved. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.

Internally calls [`getTimeToNextL2Output`](/op-stack/actions/getTimeToNextL2Output).

## Usage

:::code-group

```ts [example.ts]
import { account, publicClientL1, publicClientL2 } from './config'

const receipt = await publicClientL2.getTransactionReceipt({
  hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147'
})

const { // [!code hl]
  interval, // [!code hl]
  seconds, // [!code hl]
  timestamp // [!code hl]
} = await publicClientL1.getTimeToProve({ // [!code hl]
  receipt, // [!code hl]
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

`{ interval: number, seconds: number, timestamp: number }`

- `interval` between L2 outputs – the max time to wait for transaction to be proved.
- Estimated `seconds` until the transaction can be proved.
- Estimated `timestamp` of when the transaction can be proved.

## Parameters

### receipt

- **Type:** `TransactionReceipt`

The transaction receipt.

```ts
const time = await publicClientL1.getTimeToProve({ 
  receipt, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const time = await publicClientL1.getTimeToProve({
  l2BlockNumber,
  targetChain: optimism, // [!code focus]
})
```

### intervalBuffer (optional)

- **Type:** `number`
- **Default:** `1.1`

The buffer to account for discrepancies between non-deterministic time intervals.

```ts
const time = await publicClientL1.getTimeToProve({ 
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
const time = await publicClientL1.getTimeToProve({
  l2BlockNumber,
  l2OutputOracleAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```