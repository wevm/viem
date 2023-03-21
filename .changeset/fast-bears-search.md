---
"viem": minor
---

**Breaking:** Removed `assertChain` argument on `sendTransaction`, `writeContract` & `deployContract`. If you wish to bypass the chain check (not recommended unless for testing purposes), you can pass `chain: null`.

```diff
await walletClient.sendTransaction({
- assertChain: false,
+ chain: null,
  ...
})
```