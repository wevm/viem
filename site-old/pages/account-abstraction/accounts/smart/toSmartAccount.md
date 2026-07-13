---
description: Creates a Smart Account with a provided Account Implementation.
---

# toSmartAccount

The `toSmartAccount` function allows you to create a Smart Account with a custom Account Implementation.

## Import

```ts
import { toSmartAccount } from 'viem/account-abstraction'
```

## Usage

To instantiate a Smart Account, you will need to provide an Account Implementation. 

:::code-group

```ts twoslash [example.ts]
import { coinbase, toSmartAccount } from 'viem/account-abstraction'
import { client, owner } from './config.js'

const account = await toSmartAccount({
  client,
  entryPoint: {
    abi: [/* ... */],
    address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    version: '0.7',
  },
  
  async decodeCalls(data) {
    // Decode calls from calldata as defined by the Smart Account contract.
  },
  async encodeCalls(calls) {
    // Encode calls as defined by the Smart Account contract.
  },
  async getAddress() {
    // Get the address of the Smart Account.
  },
  async getFactoryArgs() {
    // Build the Factory properties for the Smart Account.
  },
  async getNonce() {
    // Get the nonce of the Smart Account.
  },
  async getStubSignature() {
    // Get the stub signature for User Operations from the Smart Account.
  },
  async signMessage(message) {
    // Sign message to be verified by the Smart Account contract.
  },
  async signTypedData(typedData) {
    // Sign typed data to be verified by the Smart Account contract.
  },
  async signUserOperation(userOperation) {
    // Sign a User Operation to be broadcasted via the Bundler.
  },

  // (Optional) Extend the Smart Account with custom properties.
  extend: {
    abi: [/* ... */],
    factory: {
      abi: [/* ... */],
      address: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754',
    },
  },
  // (Optional) User Operation configuration.
  userOperation: {
    async estimateGas(userOperation) {
      // Estimate gas properties for a User Operation.
    },
  },
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