---
description: Encoded correctly formatted approval-based paymaster params.
---

# getApprovalBasedPaymasterInput

Encoded correctly formatted approval-based paymaster params.

## Import
```ts
import { getApprovalBasedPaymasterInput } from 'viem/zksync'
```

## Usage

```ts
import { getApprovalBasedPaymasterInput } from 'viem/zksync'

const paymasterAddress = "0x0a67078A35745947A37A552174aFe724D8180c25";

const data = getApprovalBasedPaymasterInput({
      innerInput: new Uint8Array(),
      minimalAllowance: 1n,
      token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
    })
```

## Returns

`EncodeFunctionDataReturnType`

The `Hex` value of the provided approval-based paymaster inputs.

## Parameters

### token

token address

- **Type:** `Address`

```ts
const data = getApprovalBasedPaymasterInput({
      token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964", // [!code focus]
      minimalAllowance: 1n,
      innerInput: new Uint8Array(),
    })
```

### minimalAllowance

minimal allowance of token that can be sent towards the paymaster

- **Type:** `bigInt`

```ts
const data = getApprovalBasedPaymasterInput({
      token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
      minimalAllowance: 1n, // [!code focus]
      innerInput: new Uint8Array(),
    })
```

### innerInput

additional payload that can be sent to the paymaster to implement any logic 

- **Type:** `Hex` or `ByteArray`

```ts
const data = getApprovalBasedPaymasterInput({
      token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
      minimalAllowance: 1n, 
      innerInput: new Uint8Array([0, 1, 2, 3, 4, 5]), // [!code focus]
    })
```

```ts
const data = getApprovalBasedPaymasterInput({
      token: "0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964",
      minimalAllowance: 1n, 
      innerInput: "0x0005040302010", // [!code focus]
    })
```