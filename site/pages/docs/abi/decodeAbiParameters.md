# decodeAbiParameters [Decodes ABI encoded data.]

Decodes ABI encoded data using the [ABI specification](https://solidity.readthedocs.io/en/latest/abi-spec), given a set of ABI parameters (`inputs`/`outputs`) and the encoded ABI data.

The `decodeAbiParameters` function is used by the other contract decoding utilities (ie. `decodeFunctionData`, `decodeEventLog`, etc).

## Install

```ts
import { decodeAbiParameters } from 'viem'
```

## Usage

The `decodeAbiParameters` function takes in two parameters:

- a set of ABI Parameters (`params`), that can be in the shape of the `inputs` or `outputs` attribute of an ABI Item.
- the ABI encoded data (`data`) that correspond to the given `params`.

```ts
import { decodeAbiParameters } from 'viem'

const values = decodeAbiParameters(
  [
    { name: 'x', type: 'string' },
    { name: 'y', type: 'uint' },
    { name: 'z', type: 'bool' }
  ],
  '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000',
)
// ['wagmi', 420n, true]
```

### Human Readable

You can also pass in [Human Readable](/docs/glossary/terms#human-readable-abi) parameters with the [`parseAbiParameters` utility](/docs/abi/parseAbiParameters).

```ts
import { decodeAbiParameters, parseAbiParameters } from 'viem'

const values = decodeAbiParameters(
  parseAbiParameters('string x, uint y, bool z'),
  '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000'
)
// ['wagmi', 420n, true]
```

## Return Value

The decoded data. Type is inferred from the ABI.

## Parameters

### params

- **Type**: [`AbiParameter[]`](/docs/glossary/types#abiparameter)

The set of ABI parameters to decode against `data`, in the shape of the `inputs` or `outputs` attribute of an ABI event/function.

These parameters must include valid [ABI types](https://docs.soliditylang.org/en/develop/abi-spec#types).

```ts
const values = decodeAbiParameters(
  [{ name: 'x', type: 'uint32' }], // [!code focus]
  '0x0000000000000000000000000000000000000000000000000000000000010f2c',
)
```

### data

- **Type:** [`Hex`](/docs/glossary/types#hex)

The ABI encoded data.

```ts
const values = decodeAbiParameters(
  [{ name: 'x', type: 'uint32' }],
  '0x0000000000000000000000000000000000000000000000000000000000010f2c', // [!code focus]
)
```

## More Examples

### Simple struct

:::code-group

```ts [example.ts]
import { abi } from './abi'

const values = decodeAbiParameters(
  abi[0].outputs,
  '0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
)
// { x: 420n, y: true, z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC' }
```

```ts [abi.ts]
export const abi = [
  {
    name: 'staticStruct',
    outputs: [
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

  function staticStruct(...) returns (Foo calldata foo) { 
    ... 
    return foo;
  }
}
```

:::