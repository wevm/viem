---
'viem': patch
---

Restored positional function arguments on `Contract.from` methods and added per-call `account` support for writes.

```ts
const hash = await contract.write.transfer(
  ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 1n],
  { account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' },
)
```
