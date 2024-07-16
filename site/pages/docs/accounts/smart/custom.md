# Custom

You can build your own Smart Account Implementation using the `defineImplementation` function.

## Usage

```ts twoslash
// @noErrors
import { defineImplementation, toSmartAccount } from 'viem/accounts'
import { client } from './client'

const implementation = defineImplementation(({ client }) => ({ // [!code focus:36]
  abi: [/* ... */],
  entryPoint: {
    abi: [/* ... */],
    address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    version: '0.7',
  },
  factory: {
    abi: [/* ... */],
    address: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754',
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
  async getSignature(packedUserOperation) {
    // Get the signature of the Smart Account.
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
}))

const account = await toSmartAccount({
  client,
  implementation, // [!code focus]
})
```

:::tip
See the [`solady` implementation](https://github.com/wevm/viem/tree/main/src/accounts/implementations/solady.ts) for a reference.
:::