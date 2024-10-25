# Celo [Integrating with Celo in Viem]

Viem provides first-class support for chains implemented on [Celo](https://celo.org/).

## Chains

The following Viem chains are implemented on Celo:

```ts
import {
  celo, // [!code hl]
  celoAlfajores, // [!code hl]
} from 'viem/chains'
```

### Configuration

Viem exports Celo's chain [formatters](/docs/chains/formatters) & [serializers](/docs/chains/serializers) via `chainConfig`. This is useful if you need to define another chain which is implemented on Celo.

```ts
import { defineChain } from 'viem'
import { chainConfig } from 'viem/celo'

export const celoExample = defineChain({
  ...chainConfig,
  name: 'Celo Example',
  // ...
})
```

## Utilities

### `parseTransaction`

Parses a serialized RLP-encoded transaction. Supports signed & unsigned CIP-64, EIP-1559, EIP-2930 and Legacy Transactions.

Celo-flavored version of [Viem's `parseTransaction`](/docs/utilities/parseTransaction).

#### Parameters

- `serializedTransaction` (`Hex`): The serialized transaction.

```ts
import { parseTransaction } from 'viem/celo'

const transaction = parseTransaction('0x7cf84682a4ec80847735940084773594008094765de816845861e75a25fca122bb6898b8b1282a808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266880de0b6b3a764000080c0')
```

### `serializeTransaction`

Serializes a transaction object. Supports CIP-64, EIP-1559, EIP-2930, and Legacy transactions.

Celo-flavored version of [Viem's `serializeTransaction`](/docs/utilities/serializeTransaction).

#### Parameters

- `transaction` (`TransactionSerializable`): The transaction object to serialize.
- `signature` (`Signature`): Optional signature to include.

```ts
import { serializeTransaction } from 'viem/celo'

const serialized = serializeTransaction({
  chainId: 42220,
  gas: 21001n,
  feeCurrency: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B" // whitelisted adapter for USDC
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'),
  nonce: 69,
  to: '0x1234512345123451234512345123451234512345',
  value: parseEther('0.01'),
})
```
