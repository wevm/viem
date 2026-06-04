---
description: Requests to connect account(s) with optional capabilities.
---

# connect

Requests to connect account(s) with optional [capabilities](#capabilities).

`connect` uses [`wallet_connect`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md). If the wallet does not support `wallet_connect` and no capabilities are requested, Viem falls back to [`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102).

## Usage

:::code-group

```ts [example.ts]
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})

const { accounts } = await walletClient.connect()
```

```ts [standalone.ts]
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { connect } from 'viem/actions'
import { mainnet } from 'viem/chains'

const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})

const { accounts } = await connect(walletClient)
```

:::

## Returns

`ConnectReturnType`

Connected accounts and any returned capabilities.

```ts
type ConnectReturnType = {
  accounts: readonly {
    address: Address
    capabilities?: Record<string, unknown> | undefined
  }[]
}
```

## Parameters

### capabilities (optional)

- **Type:** `Record<string, unknown>`

Key-value pairs of [capabilities](#capabilities).

```ts
const { accounts } = await walletClient.connect({
  capabilities: {
    unstable_signInWithEthereum: {
      chainId: 1,
      nonce: 'abcd1234',
    },
  },
})
```

### chain (optional)

- **Type:** `Chain`
- **Default:** `client.chain`

Chain to connect on. Chains can use this to format `wallet_connect` request fields and capabilities.

```ts
const { accounts } = await walletClient.connect({
  chain: mainnet,
})
```

## Capabilities

### `unstable_addSubAccount`

Adds a Sub Account to the connected Account. [See more](https://github.com/ethereum/ERCs/blob/4d3d641ee3c84750baf461b8dd71d27c424417a9/ERCS/erc-7895.md).

```ts
const { accounts } = await walletClient.connect({
  capabilities: {
    unstable_addSubAccount: {
      account: {
        keys: [
          {
            key: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
            type: 'address',
          },
        ],
        type: 'create',
      },
    },
  },
})
```

### `unstable_signInWithEthereum`

Authenticate offchain using Sign-In with Ethereum. [See more](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md#signinwithethereum).

```ts
const { accounts } = await walletClient.connect({
  capabilities: {
    unstable_signInWithEthereum: {
      chainId: 1,
      nonce: 'abcd1234',
    },
  },
})
```

## Chain-specific Capabilities

Chains can add `wallet_connect` capability formatters through their chain definition. For example, Tempo chains format the `authorizeAccessKey` capability before sending the RPC request.

```ts
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { tempo } from 'viem/chains'
import type { Capabilities } from 'viem/tempo'

declare module 'viem' {
  interface Register {
    CapabilitiesSchema: Capabilities.Schema
  }
}

const walletClient = createWalletClient({
  chain: tempo,
  transport: custom(window.ethereum!),
})

const { accounts } = await walletClient.connect({
  capabilities: {
    authorizeAccessKey: {
      expiry: Math.floor(Date.now() / 1000) + 86_400,
      keyType: 'p256',
    },
    method: 'login',
  },
})
```

## JSON-RPC Methods

- [`wallet_connect`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md)
- Falls back to [`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102) when no capabilities are requested and the wallet does not support `wallet_connect`.
