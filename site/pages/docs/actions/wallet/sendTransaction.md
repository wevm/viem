---
description: Creates, signs, and sends a new transaction to the network.
---

# sendTransaction

Creates, signs, and sends a new transaction to the network.

## Usage

:::code-group

```ts twoslash [example.ts]
import { account, walletClient } from './config'
 
const hash = await walletClient.sendTransaction({ // [!code focus:99]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
// '0x...'
```

```ts twoslash [config.ts] filename="config.ts"
// [!include ~/snippets/walletClient.ts]

export const [account] = await walletClient.getAddresses()
// @log: ↑ JSON-RPC Account

// export const account = privateKeyToAccount(...)
// @log: ↑ Local Account
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `sendTransaction`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
 
const hash = await walletClient.sendTransaction({ // [!code focus:99]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
// '0x...'
```

```ts [config.ts (JSON-RPC Account)]
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

```ts twoslash [config.ts (Local Account)] filename="config.ts"
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  transport: http()
})
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### account

- **Type:** `Account | Address | null`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc). If set to `null`, it is assumed that the transport will handle filling the sender of the transaction.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### to

- **Type:** `0x${string}`

The transaction recipient or contract address.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
  value: 1000000000000000000n,
  nonce: 69
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  accessList: [ // [!code focus:6]
    {
      address: '0x1',
      storageKeys: ['0x1'],
    },
  ],
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### authorizationList (optional)

- **Type:** `AuthorizationList`

Signed EIP-7702 Authorization list.

```ts twoslash
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { eip7702Actions } from 'viem/experimental'

const account = privateKeyToAccount('0x...')

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
}).extend(eip7702Actions())
// ---cut---
const authorization = await walletClient.signAuthorization({ 
  account,
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', 
}) 

const hash = await walletClient.sendTransaction({
  account,
  authorizationList: [authorization], // [!code focus]
  data: '0xdeadbeef',
  to: account.address,
})
```

:::note
**References**
- [EIP-7702 Overview](/experimental/eip7702)
- [`signAuthorization` Docs](/experimental/eip7702/signAuthorization)
:::

### blobs (optional)

- **Type:** `Hex[]`

Blobs for [Blob Transactions](/docs/guides/blob-transactions). 

```ts
import * as cKzg from 'c-kzg'
import { toBlobs, setupKzg, stringToHex } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath) 

const hash = await walletClient.sendTransaction({
  account,
  blobs: toBlobs({ data: stringToHex('blobby blob!') }), // [!code focus]
  kzg,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

The chain is also used to infer its request type (e.g. the Celo chain has a `gatewayFee` that you can pass through to `sendTransaction`).

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
import { optimism } from 'viem/chains' // [!code focus]

const hash = await walletClient.sendTransaction({
  chain: optimism, // [!code focus]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### data (optional)

- **Type:** `0x${string}`

A contract hashed method call with encoded args.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // [!code focus]
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  account,
  gasPrice: parseGwei('20'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1') 
})
```

### kzg (optional)

- **Type:** `KZG`

KZG implementation for [Blob Transactions](/docs/guides/blob-transactions). 

See [`setupKzg`](/docs/utilities/setupKzg) for more information.

```ts
import * as cKzg from 'c-kzg'
import { toBlobs, setupKzg, stringToHex } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

const kzg = setupKzg(cKzg, mainnetTrustedSetupPath) // [!code focus]

const hash = await walletClient.sendTransaction({
  account,
  blobs: toBlobs({ data: stringToHex('blobby blob!') }), // [!code focus]
  kzg, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  account,
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  account,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n,
  nonce: 69 // [!code focus]
})
```

### value (optional)

- **Type:** `bigint`

Value in wei sent with this transaction.

```ts twoslash
// [!include ~/snippets/walletClient.ts]
// ---cut---
// @noErrors
const hash = await walletClient.sendTransaction({
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1'), // [!code focus]
  nonce: 69
})
```

## Tips

- For dapps: When using this action, it is assumed that the user has connected to their wallet (e.g. given permission for the dapp to access their accounts via [`requestAddresses`](/docs/actions/wallet/requestAddresses)). You can also check if the user has granted access to their accounts via [`getAddresses`](/docs/actions/wallet/getAddresses)

## Live Example

Check out the usage of `sendTransaction` in the live [Sending Transactions Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Methods

- JSON-RPC Accounts:
  - [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
- Local Accounts:
  - [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
