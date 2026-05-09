# createNonceManager [Creates a Nonce Manager for automatic nonce generation]

Creates a new Nonce Manager instance to be used with a [Local Account](/docs/accounts/local). The Nonce Manager is used to automatically manage & generate nonces for transactions.

:::warning
A Nonce Manager can only be used with [Local Accounts](/docs/accounts/local) (ie. Private Key, Mnemonic, etc). 

For [JSON-RPC Accounts](/docs/accounts/jsonRpc) (ie. Browser Extension, WalletConnect, Backend, etc), the Wallet or Backend will manage the nonces.
:::

## Import

```ts twoslash
import { createNonceManager } from 'viem/nonce'
```

## Usage

A Nonce Manager can be instantiated with the `createNonceManager` function with a provided `source`. 

The example below demonstrates how to create a Nonce Manager with a JSON-RPC source (ie. uses `eth_getTransactionCount` as the source of truth).

```ts twoslash
import { createNonceManager, jsonRpc } from 'viem/nonce'

const nonceManager = createNonceManager({
  source: jsonRpc()
})
```

:::tip
Viem also exports a default `nonceManager` instance that you can use directly.

```ts twoslash
import { nonceManager } from 'viem'
```
:::

### Integration with Local Accounts

A `nonceManager` can be passed as an option to [Local Accounts](/docs/accounts/local) to automatically manage nonces for transactions.

:::code-group

```ts twoslash [example.ts]
import { privateKeyToAccount, nonceManager } from 'viem/accounts' // [!code focus]
import { client } from './config'

const account = privateKeyToAccount('0x...', { nonceManager }) // [!code focus]

const hashes = await Promise.all([ // [!code focus]
// @log:   ↓ nonce = 0
  client.sendTransaction({ // [!code focus]
    account, // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
    value: parseEther('0.1'), // [!code focus]
  }), // [!code focus]
// @log:   ↓ nonce = 1
  client.sendTransaction({ // [!code focus]
    account, // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
    value: parseEther('0.2'), // [!code focus]
  }), // [!code focus]
]) // [!code focus]
```

```ts twoslash [config.ts] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})
```

:::

## Return Type

`NonceManager`

The Nonce Manager.

## Parameters

### source

- **Type:** `NonceManagerSource`

The source of truth for the Nonce Manager.

Available sources: 

- `jsonRpc`

```ts twoslash
import { createNonceManager, jsonRpc } from 'viem/nonce'

const nonceManager = createNonceManager({
  source: jsonRpc() // [!code focus]
})
```