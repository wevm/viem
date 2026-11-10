---
"viem": patch
---

Added [TIP-1165](https://tips.sh/1165) pre-authorized access key signatures: `viem/tempo` access key accounts return them from `sign`, `signMessage`, and `signTypedData` while their key authorization is pending, and Tempo's `verifyHash` (with `mode: 'allowAccessKey'`) accepts them before the access key is registered.
