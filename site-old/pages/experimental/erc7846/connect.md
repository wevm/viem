---
description: Requests to connect Account(s).
---

# connect

Requests to connect Account(s) with optional [capabilities](#capabilities).

## Usage

:::code-group

```ts twoslash [example.ts]
import { walletClient } from './config'
 
const { accounts } = await walletClient.connect() // [!code focus]
```

```ts twoslash [config.ts] filename="config.ts"
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7846Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(erc7846Actions())
```

:::

## Returns

List of connected accounts.

```ts
type ReturnType = {
  accounts: readonly {
    address: Address
    capabilities: Record<string, unknown>
  }[]
}
```

## Parameters

### `capabilities`

- **Type:** `Record<string, unknown>`

Key-value pairs of [capabilities](#capabilities).

```ts twoslash
import { walletClient } from './config'
 
const { accounts } = await walletClient.connect({
  capabilities: { // [!code focus]
    unstable_signInWithEthereum: { // [!code focus]
      chainId: 1, // [!code focus]
      nonce: 'abcd1234', // [!code focus]
    } // [!code focus]
  } // [!code focus]
})
```

## Capabilities

### `unstable_addSubAccount`

Adds a Sub Account to the connected Account. [See more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md)

```ts twoslash
import { walletClient } from './config'

const { accounts } = await walletClient.connect({
  capabilities: {
    unstable_addSubAccount: { // [!code focus]
      account: { // [!code focus]
        keys: [{ // [!code focus]
          key: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
          type: 'address', // [!code focus]
        }], // [!code focus]
        type: 'create', // [!code focus]
      } // [!code focus]
    } // [!code focus]
  }
})
// @log: [{
// @log:   address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
// @log:   capabilities: {
// @log:     unstable_subAccounts: [{
// @log:       address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
// @log:     }],
// @log:   },
// @log: }]
```

### `unstable_subAccounts`

Returns all Sub Accounts of the connected Account. [See more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md)

```ts twoslash
import { walletClient } from './config'

const { accounts } = await walletClient.connect()
// @log: [{
// @log:   address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
// @log:   capabilities: {
// @log:     unstable_subAccounts: [{
// @log:       address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
// @log:     }],
// @log:   },
// @log: }]
```


### `unstable_signInWithEthereum`

Authenticate offchain using Sign-In with Ethereum. [See more](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md#signinwithethereum)

```ts twoslash
import { walletClient } from './config'

const { accounts } = await walletClient.connect({
  capabilities: {
    unstable_signInWithEthereum: {
      chainId: 1,
      nonce: 'abcd1234',
    }
  }
})
// @log: [{
// @log:   address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
// @log:   capabilities: {
// @log:     unstable_signInWithEthereum: {
// @log:       message: 'example.com wants you to sign in with your Ethereum account...',
// @log:       signature: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
// @log:     },
// @log:   },
// @log: }]
```

## JSON-RPC Methods

- [`wallet_connect`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md)
- Falls back to [`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102)
