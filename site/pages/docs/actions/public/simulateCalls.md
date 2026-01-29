---
description: Simulates a set of calls on block(s).
---

# simulateCalls

Simulates a set of calls for a block, and optionally provides asset changes. Internally uses the [`eth_simulateV1` JSON-RPC method](https://github.com/ethereum/execution-apis/pull/484).

## Usage

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { client } from './config'
 
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [
    {
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: parseEther('1'),
    },
  ],
})

console.log(results)
// @log: [
// @log:   {
// @log:     gasUsed: 21000n,
// @log:     logs: [],
// @log:     status: "success",
// @log:   },
// @log:   {
// @log:     gasUsed: 21000n,
// @log:     logs: [],
// @log:     status: "success",
// @log:   },
// @log: ]
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

### Contract Calls

The `calls` property also accepts **Contract Calls**, and can be used via the `abi`, `functionName`, and `args` properties.

:::code-group

```ts twoslash [example.ts]
import { parseAbi, parseEther } from 'viem'
import { client } from './config'

const abi = parseAbi([
  'function mint()',
  'function transfer(address, uint256) returns (bool)',
])
 
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: parseEther('1')
    },
    {
      to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
    },
    {
      to: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      abi,
      functionName: 'transfer',
      args: [
        '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        100n
      ],
    },
  ],
})

console.log(results)
// @log: [
// @log:   {
// @log:     gasUsed: 21000n,
// @log:     logs: [],
// @log:     result: undefined,
// @log:     status: "success",
// @log:   },
// @log:   {
// @log:     gasUsed: 78394n,
// @log:     logs: [...],
// @log:     result: undefined,
// @log:     status: "success",
// @log:   },
// @log:   {
// @log:     gasUsed: 51859n,
// @log:     logs: [...],
// @log:     result: true,
// @log:     status: "success",
// @log:   },
// @log: ]
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

### Asset Changes

Providing the `traceAssetChanges` parameter (with an `account`) will return asset balance changes for the calls.

:::code-group

```ts twoslash [example.ts]
import { parseAbi, parseEther } from 'viem'
import { client } from './config'

const abi = parseAbi([
  'function mint()',
  'function transfer(address, uint256) returns (bool)',
])
 
const { assetChanges, results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: parseEther('1.5')
    },
    {
      to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
    },
    {
      to: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      abi,
      functionName: 'transfer',
      args: [
        '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        100n
      ],
    },
  ],
  traceAssetChanges: true, // [!code hl]
})

console.log(assetChanges)
// @log: [
// @log:   {
// @log:     token: {
// @log:       address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
// @log:       decimals: 18,
// @log:       symbol: "ETH",
// @log:     },
// @log:     value: {
// @log:       diff: -1500000000000000000n,
// @log:       post: 9850000000000000000000n,
// @log:       pre: 10000000000000000000000n,
// @log:     },
// @log:   }
// @log:   {
// @log:     token: {
// @log:       address: "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
// @log:       decimals: 1,
// @log:       symbol: "WAGMI",
// @log:     },
// @log:     value: {
// @log:       diff: 1n,
// @log:       post: 1n,
// @log:       pre: 0n,
// @log:     },
// @log:   },
// @log:   {
// @log:     token: {
// @log:       address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
// @log:       decimals: 18,
// @log:       symbol: "SHIB",
// @log:     },
// @log:     value: {
// @log:       diff: -1000000000000000000n,
// @log:       post: 410429569258816445970930282571360n,
// @log:       pre: 410429569258817445970930282571360n,
// @log:     },
// @log:   }
// @log: ]
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

### Reading Contracts

It is also worth noting that `simulateCalls` also supports "reading" contracts. 

:::code-group

```ts twoslash [example.ts]
import { parseAbi } from 'viem'
import { client } from './config'

const abi = parseAbi([
  'function totalSupply() returns (uint256)',
  'function ownerOf(uint256) returns (address)',
])
 
const { results } = await client.simulateCalls({
  calls: [
    {
      to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'totalSupply',
    },
    {
      to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'ownerOf',
      args: [69420n],
    },
    {
      to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'ownerOf',
      args: [13371337n],
    },
  ],
})

console.log(results)
// @log: [
// @log:   {
// @log:     result: 424122n,
// @log:     status: "success",
// @log:   },
// @log:   {
// @log:     result: "0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b",
// @log:     status: "success",
// @log:   },
// @log:   {
// @log:     error: [ContractFunctionExecutionError: token has no owner],
// @log:     status: "failure",
// @log:   },
// @log: ]
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::


## Return Value

`SimulateCallsReturnType`

Simulation results.

## Parameters

### calls

- **Type:** `Calls`

Calls to simulate.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ // [!code focus]
    { // [!code focus]
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code focus]
      value: parseEther('2'), // [!code focus]
    }, // [!code focus] 
    { // [!code focus]
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
      value: parseEther('1'), // [!code focus]
    }, // [!code focus]
  ], // [!code focus]
})
```

### calls.data

- **Type:** `Hex`

Calldata to broadcast (typically a contract function selector with encoded arguments, or contract deployment bytecode).

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ 
    { 
      data: '0xdeadbeef', // [!code focus]
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', 
      value: parseEther('2'), 
    },  
  ], 
})
```

### calls.to

- **Type:** `Address`

The recipient address.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code focus]
      value: parseEther('2'),
    },  
  ], 
})
```

### calls.value

- **Type:** `Address`

Value to send with the call.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'), // [!code focus]
    },  
  ], 
})
```

### account (optional)

- **Type:** `Account | Address`

The account to simulate the calls from.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', // [!code focus]
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },  
  ], 
})
```

### blockNumber (optional)

- **Type:** `bigint`

The block number to simulate the calls at.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  blockNumber: 17030000n, // [!code focus]
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },  
  ], 
})
```

### blockTag (optional)

- **Type:** `BlockTag`

The block tag to simulate the calls at.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  blockTag: 'pending', // [!code focus]
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },  
  ], 
})
```

### stateOverrides (optional)

- **Type:** `StateOverride`

The state overrides to simulate the calls with.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },  
  ], 
  stateOverrides: [{ // [!code focus]
    address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', // [!code focus]
    balance: parseEther('10000'), // [!code focus]
  }], // [!code focus]
})
```

### traceAssetChanges (optional)

- **Type:** `boolean`

Whether to trace asset changes.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },  
  ], 
  traceAssetChanges: true, // [!code focus]
})
```

### traceTransfers (optional)

- **Type:** `boolean`

Whether to trace transfers.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },  
  ], 
  traceTransfers: true, // [!code focus]
})
```

### validation (optional)

- **Type:** `boolean`

Whether to enable validation mode.

```ts twoslash
import { parseEther } from 'viem'
import { client } from './config'
// ---cut---
const { results } = await client.simulateCalls({
  account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
  calls: [ 
    { 
      to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
      value: parseEther('2'),
    },  
  ], 
  validation: true, // [!code focus]
})
```
