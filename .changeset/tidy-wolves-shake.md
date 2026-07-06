---
"viem": patch
---

`viem/tempo`: Supported calling token `.call` builders without a Client (restores the pre-`2.54` call signature).

```ts
// With a Client (resolves declared token symbols, infers `decimals`):
Actions.token.transfer.call(client, { token, to, amount })

// Without a Client (`token` must be a TIP20 token id or contract address,
// and formatted amounts require explicit `decimals`):
Actions.token.transfer.call({ token, to, amount })
```
