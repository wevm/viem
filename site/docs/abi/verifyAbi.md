---
head:
  - - meta
    - property: og:title
      content: verifyAbi
  - - meta
    - name: description
      content: Verify that the ABI matches the contents of the bytecode.
  - - meta
    - property: og:description
      content: Verify that the ABI matches the contents of the bytecode.

---

# verifyAbi

Verify that the ABI matches the contents of the bytecode.

## Import

```ts
import { verifyAbi } from 'viem'
```

## Usage

```ts
import { verifyAbi } from 'viem'

try { // [!code focus:4]
  verifyAbi(abi, bytecode)
} catch(error) {
  console.error(error.message)
}
```

## Returns

`void`

## Parameters

### abi

- **Type:** `AbiItem[]`

The ABI to verify.

### bytecode

- **Type:** `string`

The bytecode to verify against.
