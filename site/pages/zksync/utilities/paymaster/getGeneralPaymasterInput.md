---
description: Returns encoded formatted general-based paymaster params.
---

# getGeneralPaymasterInput

Returns encoded formatted general-based paymaster params.

## Import
```ts
import { getGeneralPaymasterInput } from 'viem/zksync'
```

## Usage

```ts
import { getGeneralPaymasterInput } from 'viem/zksync'

const data = getGeneralPaymasterInput({
  innerInput: '0x',
})
```

## Returns

`EncodeFunctionDataReturnType`

The `Hex` value of the provided general-based paymaster inputs.

## Parameters

### innerInput

Additional payload that can be sent to the paymaster to implement any logic 

- **Type:** `Hex` or `ByteArray`

```ts
const data = getGeneralPaymasterInput({
      innerInput: new Uint8Array([0, 1, 2, 3, 4, 5]), // [!code focus]
    })
```

```ts
const data = getGeneralPaymasterInput({
      innerInput: "0x0005040302010", // [!code focus]
    })
```