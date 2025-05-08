---
description: Executes batches of call(s) on an ERC-7821-compatible contract.
---

# executeBatches

Executes batches of call(s) using the ["batch of batches" mode](https://eips.ethereum.org/EIPS/eip-7821#optional-batch-of-batches-mode) on an [ERC-7821-compatible contract](https://eips.ethereum.org/EIPS/eip-7821).


## Usage

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { account, client } from './config'
 
const hash = await client.executeBatches({ // [!code focus:99]
  account,
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('2')
        },
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { erc7821Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')

export const client = createClient({
  chain: mainnet,
  transport: http(),
}).extend(erc7821Actions())
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `sendCalls`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { account, client } from './config'
 
const hash = await client.execute({ // [!code focus:99]
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('2')
        },
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { erc7821Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')

export const client = createClient({
  account,
  chain: mainnet,
  transport: http(),
}).extend(erc7821Actions())
```

:::

### Contract Calls

The `calls` property also accepts **Contract Calls**, and can be used via the `abi`, `functionName`, and `args` properties.

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { account, client } from './config'

const abi = parseAbi([
  'function approve(address, uint256) returns (bool)',
  'function transferFrom(address, address, uint256) returns (bool)',
])
 
const hash = await client.execute({ // [!code focus:99]
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
          abi,
          functionName: 'approve',
          args: [
            '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 
            100n
          ],
        },
        {
          to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
          abi,
          functionName: 'transferFrom',
          args: [
            '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            '0x0000000000000000000000000000000000000000',
            100n
          ],
        },
      ],
    },
  ],
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { erc7821Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0x...')

export const client = createClient({
  account,
  chain: mainnet,
  transport: http(),
}).extend(erc7821Actions())
```

:::

## Return Value

[`Hash`](/docs/glossary/types#hash)

A [Transaction Hash](/docs/glossary/terms#hash).

## Parameters

### account

- **Type:** `Account | Address | null`

Account to invoke the execution of the calls.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc). If set to `null`, it is assumed that the transport will handle filling the sender of the transaction.

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
})
```

### address

- **Type:** `0x${string}`

Address of the contract to execute the calls on.

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code focus]
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
})
```

### batches

- **Type:** `{ calls: Call[], opData?: Hex }[]`

Set of call batches to execute.

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [ // [!code focus]
    { // [!code focus]
      calls: [ // [!code focus]
        { // [!code focus]
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
          value: parseEther('1') // [!code focus]
        }, // [!code focus]
      ] // [!code focus]
    }, // [!code focus]
    { // [!code focus]
      calls: [ // [!code focus]
        { // [!code focus]
          data: '0xdeadbeef', // [!code focus]
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
        }, // [!code focus] 
      ], // [!code focus]
    }, // [!code focus]
  ], // [!code focus]
})
```

### batches.calls

- **Type:** `Call[]`

Set of calls in a batch to execute.

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [ // [!code focus]
        { // [!code focus]
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
          value: parseEther('1') // [!code focus]
        }, // [!code focus]
      ] // [!code focus]
    },
    {
      calls: [ // [!code focus]
        { // [!code focus]
          data: '0xdeadbeef', // [!code focus]
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
        }, // [!code focus] 
      ], // [!code focus]
    },
  ], 
})
```

### batches.opData (optional)

- **Type:** `Hex`

Additional data to pass to execution.

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ],
      opData: '0xdeadbeef', // [!code focus]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
})
```

### authorizationList (optional)

- **Type:** `AuthorizationList`

Signed EIP-7702 Authorization list.

```ts twoslash
// @noErrors
import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { erc7821Actions } from 'viem/experimental'

const account = privateKeyToAccount('0x...')

export const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
})
  .extend(erc7821Actions())
// ---cut---
const authorization = await client.signAuthorization({ 
  contractAddress: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', 
}) 

const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  authorizationList: [authorization], // [!code focus]
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ], 
})
```

:::note
**References**
- [EIP-7702 Overview](/docs/eip7702)
- [`signAuthorization` Docs](/docs/eip7702/signAuthorization)
:::

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `client.chain`

Chain to execute the calls on.

```ts twoslash
import { client } from './config'
// ---cut---
import { optimism } from 'viem/chains' // [!code focus]

const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
  chain: optimism, // [!code focus]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas.

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
  gasPrice: parseGwei('20'), // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. 

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
  maxFeePerGas: parseGwei('20'), // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). 

```ts twoslash
import { client } from './config'
// ---cut---
const hash = await client.execute({
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  batches: [
    {
      calls: [
        {
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: parseEther('1')
        },
      ]
    },
    {
      calls: [
        {
          data: '0xdeadbeef',
          to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        },
      ],
    },
  ],
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
})
```

