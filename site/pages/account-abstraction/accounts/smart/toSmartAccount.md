---
description: Creates a Smart Account with a provided Account Implementation.
---

# toSmartAccount

Creates a Smart Account with a provided Account [Implementation](/account-abstraction/accounts/smart/toSmartAccount#implementation) and [Client](/docs/clients/public).

## Import

```ts
import { toSmartAccount } from 'viem/account-abstraction'
```

## Usage

To instantiate a Smart Account, you will need to provide an Account [Implementation](/account-abstraction/accounts/smart/toSmartAccount#implementation) as well as a [Client](/docs/clients/public). 

For the example below, we will use the [`coinbase` Implementation](/account-abstraction/accounts/smart/coinbase) (Coinbase Smart Wallet).

:::code-group

```ts twoslash [example.ts]
import { coinbase, toSmartAccount } from 'viem/account-abstraction'
import { client, owner } from './config.js'

const account = await toSmartAccount({
  client,
  implementation: coinbase({
    owners: [owner],
  }),
})
```

```ts twoslash [config.ts] filename="config.ts"
import { http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const owner = privateKeyToAccount('0x...')
 
export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

## Returns

`SmartAccount`

The Smart Account.

## Parameters

### address

- **Type:** `Address`

Address of the Smart Account.

```ts
const account = await toSmartAccount({
  address: '0x0000000000000000000000000000000000000000', // [!code focus]
  client,
  implementation: coinbase({
    owners: [owner],
  }),
})
```

### client

- **Type:** `Client`

Client used to retrieve Smart Account data, and perform signing (if owner is a [JSON-RPC Account](/docs/accounts/jsonRpc)).

```ts
import { coinbase, toSmartAccount } from 'viem/account-abstraction'
import { owner } from './config.js'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createPublicClient({ // [!code focus]
  chain: mainnet, // [!code focus]
  transport: http(), // [!code focus]
}) // [!code focus]

const account = await toSmartAccount({
  address: '0x0000000000000000000000000000000000000000',
  client, // [!code focus]
  implementation: coinbase({
    owners: [owner],
  }),
})
```

### implementation

- **Type:** `SmartAccountImplementation`

Implementation of the Smart Account.

```ts
const account = await toSmartAccount({
  address: '0x0000000000000000000000000000000000000000',
  client,
  implementation: coinbase({ // [!code focus]
    owners: [owner], // [!code focus]
  }), // [!code focus]
})
```