---
description: Recovers the signing address from a transaction & signature.
---

# recoverTransactionAddress

Recovers the original signing address from a transaction & signature.

## Usage

:::code-group

```ts twoslash [example.ts]
import { recoverTransactionAddress } from 'viem'
import { walletClient } from './client'

const request = await walletClient.prepareTransactionRequest({
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})

const serializedTransaction = await walletClient.signTransaction(request)

const address = await recoverTransactionAddress({ // [!code focus:99]
  serializedTransaction,
})
```

```ts [client.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'

// Retrieve Account from an EIP-1193 Provider.
const [account] = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
})

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum!)
})
```

```ts twoslash [config.ts (Local Account)] filename="client.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  transport: http()
})
```

:::

## Returns

[`Address`](/docs/glossary/types#address)

The signing address.

## Parameters

### serializedTransaction

- **Type:** `TransactionSerialized`

The RLP serialized transaction.

### signature (optional)

- **Type:** `Signature | Hex | ByteArray`
- **Default:** Signature inferred on `serializedTransaction` (if exists)

The signature.