# ZKsync [Integrating with ZKsync in Viem]

Viem provides first-class support for chains implemented on [ZKsync](https://zksync.io/).

## Chains

The following Viem chains are implemented on ZKsync:

```ts
import {
  zksync, // [!code hl]
  zksyncSepoliaTestnet, // [!code hl]
} from 'viem/chains'
```

### Configuration

Viem exports ZKsync's chain [formatters](/docs/chains/formatters) & [serializers](/docs/chains/serializers) via `chainConfig`. This is useful if you need to define another chain which is implemented on ZKsync.

```ts
import { defineChain } from 'viem'
import { chainConfig } from 'viem/zksync'

export const zkSyncExample = defineChain({
  ...chainConfig,
  name: 'ZKsync Example',
  // ...
})
```

## Utilities

### `serializeTransaction`

Serializes a transaction object. Supports EIP-712, EIP-1559, EIP-2930, and Legacy transactions.

ZKsync-flavored version of [Viem's `serializeTransaction`](/docs/utilities/serializeTransaction).

#### Parameters

- `transaction` (`TransactionSerializable`): The transaction object to serialize.
- `signature` (`Signature`): Optional signature to include.

```ts
import { serializeTransaction } from 'viem/zksync'

const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'),
  nonce: 69,
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  to: '0x1234512345123451234512345123451234512345',
  type: 'eip712',
  value: parseEther('0.01'),
})
```
