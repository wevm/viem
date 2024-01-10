---
outline: deep
description: Estimates gas required to prove a withdrawal that occurred on an L2.
---

# estimateProveWithdrawalGas

Estimates gas required to prove a withdrawal that occurred on an L2. 

## Usage

:::code-group

```ts [example.ts]
import { optimism } from 'viem/chains'
import { account, publicClientL1 } from './config'

const gas = await publicClientL1.estimateProveWithdrawalGas({ // [!code hl]
  account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // [!code hl]
  l2OutputIndex: 4529n, // [!code hl]
  outputRootProof: { ... }, // [!code hl]
  targetChain: optimism, // [!code hl]
  withdrawalProof: [ ... ], // [!code hl]
  withdrawal: { ... }, // [!code hl]
}) // [!code hl]
```

```ts [config.ts]
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { publicActionsL1 } from 'viem/op-stack'

export const publicClientL1 = createPublicClient({
  chain: mainnet,
  transport: http()
}).extend(publicActionsL1())

// JSON-RPC Account
export const [account] = await walletClientL1.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

## Returns

`bigint`

The estimated gas.

## Parameters

### account

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  l2OutputIndex: 4529n,
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `client.chain`

The L1 chain. If there is a mismatch between the wallet's current chain & this chain, an error will be thrown.

```ts
import { mainnet } from 'viem/chains'

const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  chain: mainnet, // [!code focus]
  l2OutputIndex: 4529n,
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### gas (optional)

- **Type:** `bigint`

Gas limit for transaction execution on the L1. 

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  gas: 420_000n,  // [!code focus]
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### l2OutputIndex 

- **Type:** `bigint`

The index of the L2 output. Typically derived from the [`buildProveWithdrawal` Action](/op-stack/actions/buildProveWithdrawal).

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n, // [!code focus]
  gas: 420_000n, 
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. 

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  maxFeePerGas: parseGwei('20'), 
  maxPriorityFeePerGas: parseGwei('2'),  // [!code focus]
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  nonce: 69, // [!code focus]
  targetChain: optimism,
})
```

### outputRootProof (optional)

- **Type:** `bigint`

The proof of the L2 output. Typically derived from the [`buildProveWithdrawal` Action](/op-stack/actions/buildProveWithdrawal).

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  gas: 420_000n, 
  outputRootProof: { /* ... */ }, // [!code focus]
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### portalAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.portal[chainId].address`

The address of the [Optimism Portal contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol). Defaults to the Optimism Portal contract specified on the `targetChain`.

If a `portalAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  outputRootProof: { /* ... */ },
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
  targetChain: optimism,
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
})
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain to execute the transaction on.

```ts
import { mainnet } from 'viem/chains'

const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ },
  targetChain: optimism, // [!code focus]
})
```

### withdrawalProof

- **Type:** `bigint`

The proof of the L2 withdrawal. Typically derived from the [`buildProveWithdrawal` Action](/op-stack/actions/buildProveWithdrawal).

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  gas: 420_000n, 
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ], // [!code focus]
  withdrawal: { /* ... */ },
  targetChain: optimism,
})
```

### withdrawal

- **Type:** `bigint`

The withdrawal. Typically derived from the [`buildProveWithdrawal` Action](/op-stack/actions/buildProveWithdrawal).

```ts
const hash = await client.estimateProveWithdrawalGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  l2OutputIndex: 4529n,
  gas: 420_000n, 
  outputRootProof: { /* ... */ },
  withdrawalProof: [ /* ... */ ],
  withdrawal: { /* ... */ }, // [!code focus]
  targetChain: optimism,
})
```