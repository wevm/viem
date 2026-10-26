---
outline: deep
description: Returns the current status of a withdrawal. 
---

# getWithdrawalStatus

Returns the current status of a withdrawal. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow. 

## Usage

:::code-group

```ts [example.ts]
import { account, publicClientL1, publicClientL2 } from './config'

const receipt = await publicClientL2.getTransactionReceipt({
  hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147'
})

const status = await publicClientL1.getWithdrawalStatus({ // [!code hl]
  receipt, // [!code hl]
  targetChain: publicClientL2.chain, // [!code hl]
}) // [!code hl]
// "ready-to-prove" // [!code hl]
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

`"waiting-to-prove" | "ready-to-prove" | "waiting-to-finalize" | "ready-to-finalize" | "finalized"`

## Parameters

### receipt

- **Type:** `TransactionReceipt`

The transaction receipt.

```ts
const status = await publicClientL1.getWithdrawalStatus({ 
  receipt, // [!code focus]
  targetChain: optimism, 
}) 
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain.

```ts
const status = await publicClientL1.getWithdrawalStatus({
  receipt,
  targetChain: optimism, // [!code focus]
})
```

### l2OutputOracleAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.l2OutputOracle[chainId].address`

The address of the [L2 Output Oracle contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal2.sol). Defaults to the L2 Output Oracle contract specified on the `targetChain`.

If a `l2OutputOracleAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const status = await publicClientL1.getWithdrawalStatus({
  receipt,
  l2OutputOracleAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed'
})
```

### l2Timestamp (optional)

- **Type:** `bigint`
- **Default:** `blockTimestamp` of the receipt's logs for super-root games, otherwise the receipt's block number

The L2 timestamp of the withdrawal. Dispute games that anchor on super roots (e.g. OP Mainnet) are matched by L2 timestamp instead of L2 block number. For these games, if `l2Timestamp` is not passed and the receipt's logs have no `blockTimestamp`, an `L2TimestampRequiredError` is thrown.

```ts
const status = await publicClientL1.getWithdrawalStatus({
  l2Timestamp: 1792936085n, // [!code focus]
  receipt,
  targetChain: optimism,
})
```

### portalAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.portal[chainId].address`

The address of the [Portal contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal2.sol). Defaults to the L2 Output Oracle contract specified on the `targetChain`.

If a `portalAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const status = await publicClientL1.getWithdrawalStatus({
  receipt,
  l2OutputOracleAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```
