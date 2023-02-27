---
head:
  - - meta
    - property: og:title
      content: signMessage
  - - meta
    - name: description
      content: Calculates an Ethereum-specific signature.
  - - meta
    - property: og:description
      content: Calculates an Ethereum-specific signature.

---

# signMessage

Calculates an Ethereum-specific signature in the form of `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

Takes a byte array or hex value as the `data` argument.

## Usage

```ts
import { walletClient } from '.'
 
const message = await walletClient.signMessage({ // [!code focus:99]
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: '0xdeadbeaf',
})
// "0xa3f20717a250c2b0b729b7e5becbff67fdaef7e0699da4de7ca5895b02a170a12d887fd3b17bfdce3481f10bea41f45ba9f709d39ce8325427b57afcfc994cee1b"
```

## Returns

`0x${string}`

The signed message.

## Parameters

### from

- **Type:** `Address`

Address to use for signing.

```ts
const message = await walletClient.signMessage({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus:1]
  data: '0xdeadbeaf',
})
```

### data

- **Type:** `string`

Message to sign.

```ts
const message = await walletClient.signMessage({
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  data: 'hello world', // [!code focus:1]
})
```
