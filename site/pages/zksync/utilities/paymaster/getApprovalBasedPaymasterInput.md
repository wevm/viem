---
description: Returns encoded formatted approval-based paymaster params.
---

# getApprovalBasedPaymasterInput

Returns encoded formatted approval-based paymaster params.

## Import

```ts
import { getApprovalBasedPaymasterInput } from 'viem/zksync'
```

## Usage

```ts
import { getApprovalBasedPaymasterInput } from 'viem/zksync'

const data = getApprovalBasedPaymasterInput({
  innerInput: '0x',
  minAllowance: 1n,
  token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
})
```

## Returns

`EncodeFunctionDataReturnType`

The `Hex` value of the provided approval-based paymaster inputs.

## Parameters

### token

- **Type:** `Address`

The token address.

```ts
const data = getApprovalBasedPaymasterInput({
  innerInput: '0x',
  minAllowance: 1n,
  token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964", // [!code focus]
})
```

### minAllowance

- **Type:** `bigint`

Minimum allowance (in wei) of token that can be sent towards the paymaster.

```ts
const data = getApprovalBasedPaymasterInput({
  innerInput: new Uint8Array(),
  minAllowance: 1n, // [!code focus]
  token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
})
```

### innerInput

- **Type:** `Hex | ByteArray`

Additional payload that can be sent to the paymaster to implement any logic .

```ts
const data = getApprovalBasedPaymasterInput({
  innerInput: "0x0005040302010", // [!code focus]
  minAllowance: 1n, 
  token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
})
```