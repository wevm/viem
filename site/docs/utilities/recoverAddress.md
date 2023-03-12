---
head:
  - - meta
    - property: og:title
      content: recoverAddress
  - - meta
    - name: description
      content: Given a messageHash and signature, recover its signing address.
  - - meta
    - property: og:description
      content: Given a messageHash and signature, recover its signing address.

---

# recoverAddress

Recovers the original signing address from a messageHash and signature. 

This can be useful for recovering the signining address for a signed message. 

## Usage

::: code-group

```ts [example.ts]
import { recoverAddress } from './viem'
 
const address = await recoverAddress( // [!code focus:4]
  "0xb1ffabbf8c051d2e5ecee0b69621eec616823c3fd329974590ef274cb9d54220",
  "0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c"
) 
// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```
:::

## Returns

[`Address`](/docs/glossary/types#address)

The signing address of the signed message.