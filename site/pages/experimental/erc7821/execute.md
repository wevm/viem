---
description: TODO
---

# execute

TODO


## Usage

TODO

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { account, client } from './config'
 
const hash = await client.execute({ // [!code focus:99]
  account,
  address: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: parseEther('1')
    },
    {
      data: '0xdeadbeef',
      to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
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
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: parseEther('1')
    },
    {
      data: '0xdeadbeef',
      to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
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
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: parseEther('1')
    },
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

TODO
