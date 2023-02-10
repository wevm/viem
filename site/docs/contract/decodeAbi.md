# decodeAbi

Decodes ABI encoded data using the [ABI specification](https://solidity.readthedocs.io/en/latest/abi-spec.html), given a set of ABI parameters (`inputs`/`outputs`) and the encoded ABI data.

The `decodeAbi` function is used by the other contract decoding utilities (ie. `decodeFunctionData`, `decodeEventTopics`, etc).

## Install

```ts
import { decodeAbi } from 'viem/contract'
```

## Usage

The `decodeAbi` function accepts:

- a set of parameters (`params`), in the shape of the `inputs` or `outputs` attribute of an ABI event/function.
- the ABI encoded data (`data`) that correspond to the given `params`.

```ts
import { decodeAbi } from 'viem/contract'

const values = decodeAbi({
  data: '0x0000000000000000000000000000000000000000000000000000000000010f2c',
  params: [{ internalType: 'uint32', name: 'x', type: 'uint32' }],
})
// [69420]
```

## Return Value

The decoded data. Type is inferred from the ABI.

## Parameters

### data

- **Type**: `Hex`

The ABI encoded data.

```ts
const values = decodeAbi({
  data: '0x0000000000000000000000000000000000000000000000000000000000010f2c', // [!code focus]
  params: [{ internalType: 'uint32', name: 'x', type: 'uint32' }],
})
```

### params

- **Type**: [`AbiParameter[]`](/TODO)

The set of ABI parameters to decode against `data`, in the shape of the `inputs` or `outputs` attribute of an ABI event/function.

These parameters must include valid [ABI types](https://docs.soliditylang.org/en/develop/abi-spec.html#types).

```ts
const values = decodeAbi({
  data: '0x0000000000000000000000000000000000000000000000000000000000010f2c',
  params: [{ internalType: 'uint32', name: 'x', type: 'uint32' }], // [!code focus]
})
```

## More Examples

### Simple struct

::: code-group

```ts [example.ts]
import { abi } from './abi'

const values = decodeAbi({
  data: '0x00000000000000000000000000000000000000000000000000000000000001a40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
  params: abi[0].outputs
})
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
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct Example.Foo',
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