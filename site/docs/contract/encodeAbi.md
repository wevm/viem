# encodeAbi

Generates ABI encoded data using the [ABI specification](https://solidity.readthedocs.io/en/latest/abi-spec.html), given a set of ABI parameters (`inputs`/`outputs`) and their corresponding values.

The `encodeAbi` function is used by the other contract encoding utilities (ie. `encodeFunctionData`, `encodeEventTopics`, etc).

## Import

```ts
import { encodeAbi } from 'viem/contract'
```

## Usage

The `encodeAbi` function accepts:

- a set of parameters (`params`), in the shape of the `inputs` or `outputs` attribute of an ABI event/function.
- a set of values (`values`) that correspond to the given `params`.


```ts
import { encodeAbi } from 'viem/contract'

const encodedData = encodeAbi({
  params: [{ internalType: 'uint32', name: 'x', type: 'uint32' }],
  values: [69420]
})
// 0x0000000000000000000000000000000000000000000000000000000000010f2c
```

## Returns

`Hex`

The ABI encoded data.

## Parameters

### params

- **Type**: [`AbiParameter[]`](/TODO)

The set of ABI parameters to encode, in the shape of the `inputs` or `outputs` attribute of an ABI event/function.

These parameters must include valid [ABI types](https://docs.soliditylang.org/en/develop/abi-spec.html#types).

```ts
encodeAbi({
  params: [{ internalType: 'uint32', name: 'x', type: 'uint32' }], // [!code focus]
  values: [69420]
})
```

### values

- **Type**: [`AbiParametersToPrimitiveTypes<AbiParameter[]>`](/TODO)

The set of primitive values that correspond to the ABI types defined in `params`.

```ts
encodeAbi({
  params: [{ internalType: 'uint32', name: 'x', type: 'uint32' }],
  values: [69420] // [!code focus]
})
```

## More Examples

### Simple struct

::: code-group

```ts [example.ts]
import { abi } from './abi'

const encodedData = encodeAbi({
  params: abi[0].inputs,
  values: [{
    x: 420n,
    y: true,
    z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  }],
})
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

  function staticStruct(Foo calldata foo) { ... }
}
```

:::