---
description: Generates ABI encoded data.
---

# encodeAbiParameters

Generates ABI encoded data using the [ABI specification](https://docs.soliditylang.org/en/latest/abi-spec.html), given a set of ABI parameters (`inputs`/`outputs`) and their corresponding values.

The `encodeAbiParameters` function is used by the other contract encoding utilities (ie. `encodeFunctionData`, `encodeEventTopics`, etc).

## Import

```ts
import { encodeAbiParameters } from 'viem'
```

## Usage

The `encodeAbiParameters` function takes in two parameters:

- a set of ABI Parameters (`params`), that can be in the shape of the `inputs` or `outputs` attribute of an ABI Item.
- a set of values (`values`) that correspond to the given `params`.


```ts
import { encodeAbiParameters } from 'viem'

const encodedData = encodeAbiParameters(
  [
    { name: 'x', type: 'string' },
    { name: 'y', type: 'uint' },
    { name: 'z', type: 'bool' }
  ],
  ['wagmi', 420n, true]
)
// 0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000
```

### Human Readable

You can also pass in [Human Readable](/docs/glossary/terms#human-readable-abi) parameters with the [`parseAbiParameters` utility](/docs/abi/parseAbiParameters).

```ts
import { encodeAbiParameters, parseAbiParameters } from 'viem'

const encodedData = encodeAbiParameters(
  parseAbiParameters('string x, uint y, bool z'),
  ['wagmi', 420n, true]
)
// 0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The ABI encoded data.

## Parameters

### params

- **Type**: [`AbiParameter[]`](/docs/glossary/terms#abiparameter)

The set of ABI parameters to encode, in the shape of the `inputs` or `outputs` attribute of an ABI event/function.

These parameters must include valid [ABI types](https://docs.soliditylang.org/en/develop/abi-spec#types).

```ts
encodeAbiParameters(
  [{ name: 'x', type: 'uint32' }], // [!code focus]
  [69420]
)
```

### values

- **Type**: [`AbiParametersToPrimitiveTypes<AbiParameter[]>`](/docs/glossary/terms#abiparameterstoprimitivetypes)

The set of primitive values that correspond to the ABI types defined in `params`.

```ts
encodeAbiParameters(
  [{ name: 'x', type: 'uint32' }],
  [69420] // [!code focus]
)
```

## More Examples

### Simple struct

:::code-group

```ts [example.ts]
import { abi } from './abi'

const encodedData = encodeAbiParameters(
  abi[0].inputs,
  [{
    x: 420n,
    y: true,
    z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  }],
)
// 0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac
```

```ts [abi.ts]
export const abi = [
  {
    name: 'staticStruct',
    inputs: [
      {
        components: [
          {
            name: 'x',
            type: 'uint256',
          },
          {
            name: 'y',
            type: 'bool',
          },
          {
            name: 'z',
            type: 'address',
          },
        ],
        name: 'foo',
        type: 'tuple',
      },
    ],
  }
] as const
```

```solidity [Example.sol]
contract Example {
  struct Foo {
    uint256 x;
    bool y;
    address z;
  }

  function staticStruct(Foo calldata foo) { ... }
}
```

:::
