---
'viem': patch
---

Added per-call `account` support to `Contract.from` write methods.

```ts
const hash = await contract.write.transfer({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  args: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 1n],
})
```
