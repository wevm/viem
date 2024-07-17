# signMessage (Smart Account)

Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

Uses the Smart Account's **Owner** to sign the message.

## Usage

:::code-group

```ts twoslash [example.ts]
import { toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { client, owner } from './config.js'

const account = await toSmartAccount({
  client,
  owners: [owner],
})

const signature = await account.signMessage({ // [!code focus]
  message: 'hello world', // [!code focus]
}) // [!code focus]
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

[`Hex`](/docs/glossary/types#hex)

The signed message.

## Parameters

### message

- **Type:** `string | { raw: Hex | ByteArray }`

Message to sign.

By default, viem signs the UTF-8 representation of the message.

```ts twoslash
import { toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { client, owner } from './config.js'

const account = await toSmartAccount({
  client,
  owners: [owner],
})
// ---cut---
const signature = await account.signMessage({
  message: 'hello world', // [!code focus:1]
})
```

To sign the data representation of the message, you can use the `raw` attribute.

```ts twoslash
import { toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { client, owner } from './config.js'

const account = await toSmartAccount({
  client,
  owners: [owner],
})
// ---cut---
const signature = await account.signMessage({
  message: { raw: '0x68656c6c6f20776f726c64' }, // [!code focus:1]
})
```
