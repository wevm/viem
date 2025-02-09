---
description: Simulates a set of calls on block(s).
---

# simulateBlocks

Simulates a set of calls on block(s) with optional block and state overrides. Internally uses the [`eth_simulateV1` JSON-RPC method](https://github.com/ethereum/execution-apis/pull/484).

## Usage

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { client } from './config'
 
const result = await client.simulateBlocks({
  blocks: [{
    blockOverrides: {
      number: 69420n,
    },
    calls: [
      {
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
        to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
        value: parseEther('2'),
      },
      {
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        value: parseEther('1'),
      },
    ],
    stateOverrides: [{
      address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
      balance: parseEther('10'),
    }],
  }]
})
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
  'function approve(address, uint256) returns (bool)',
  'function transferFrom(address, address, uint256) returns (bool)',
])
 
const result = await client.simulateBlocks({ // [!code focus:99]
  blocks: [{
    calls: [
      {
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        value: parseEther('1')
      },
      {
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
        to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
        abi,
        functionName: 'approve',
        args: [
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 
          100n
        ],
      },
      {
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
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
  }]
})
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

`SimulateBlocksReturnType`

Simulation results.

## Parameters

### blocks

Blocks to simulate.

### blocks.calls

- **Type:** `TransactionRequest[]`

Calls to simulate. Each call can consist of transaction request properties.

```ts twoslash
import { client } from './config'
// ---cut---
const result = await client.simulateBlocks({
  blocks: [{
    blockOverrides: {
      number: 69420n,
    },
    calls: [ // [!code focus]
      { // [!code focus]
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', // [!code focus]
        data: '0xdeadbeef', // [!code focus]
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
      }, // [!code focus]
      { // [!code focus]
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', // [!code focus]
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
        value: parseEther('1'), // [!code focus]
      }, // [!code focus]
    ], // [!code focus]
    stateOverrides: [{
      address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
      balance: parseEther('10'),
    }],
  }]
})
```

### blocks.blockOverrides

- **Type:** `BlockOverrides`

Values to override on the block.

```ts twoslash
import { client } from './config'
// ---cut---
const result = await client.simulateBlocks({
  blocks: [{
    blockOverrides: { // [!code focus]
      number: 69420n, // [!code focus]
    }, // [!code focus]
    calls: [ 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        data: '0xdeadbeef', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
      }, 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
        value: parseEther('1'), 
      }, 
    ], 
    stateOverrides: [{
      address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
      balance: parseEther('10'),
    }],
  }]
})
```

### blocks.stateOverrides

- **Type:** `StateOverride`

State overrides.

```ts twoslash
import { client } from './config'
// ---cut---
const result = await client.simulateBlocks({
  blocks: [{
    blockOverrides: {
      number: 69420n,
    },
    calls: [ 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        data: '0xdeadbeef', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
      }, 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
        value: parseEther('1'), 
      }, 
    ], 
    stateOverrides: [{ // [!code focus]
      address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', // [!code focus]
      balance: parseEther('10'), // [!code focus]
    }], // [!code focus]
  }]
})
```

### returnFullTransactions

- **Type:** `boolean`

Whether to return the full transactions.

```ts twoslash
import { client } from './config'
// ---cut---
const result = await client.simulateBlocks({
  blocks: [{
    blockOverrides: {
      number: 69420n,
    },
    calls: [ 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        data: '0xdeadbeef', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
      }, 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
        value: parseEther('1'), 
      }, 
    ], 
    stateOverrides: [{
      address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
      balance: parseEther('10'),
    }],
  }],
  returnFullTransactions: true, // [!code focus]
})
```

### traceTransfers

- **Type:** `boolean`

Whether to trace transfers.

```ts twoslash
import { client } from './config'
// ---cut---
const result = await client.simulateBlocks({
  blocks: [{
    blockOverrides: {
      number: 69420n,
    },
    calls: [ 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        data: '0xdeadbeef', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
      }, 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
        value: parseEther('1'), 
      }, 
    ], 
    stateOverrides: [{
      address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
      balance: parseEther('10'),
    }],
  }],
  traceTransfers: true, // [!code focus]
})
```

### validation

- **Type:** `boolean`

Whether to enable validation mode.

```ts twoslash
import { client } from './config'
// ---cut---
const result = await client.simulateBlocks({
  blocks: [{
    blockOverrides: {
      number: 69420n,
    },
    calls: [ 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        data: '0xdeadbeef', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
      }, 
      { 
        from: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929', 
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
        value: parseEther('1'), 
      }, 
    ], 
    stateOverrides: [{
      address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
      balance: parseEther('10'),
    }],
  }],
  validation: true, // [!code focus]
})
```
