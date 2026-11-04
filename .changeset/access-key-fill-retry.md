---
"viem": patch
---

`viem/tempo`: Removed the `getKey` read before transactions from an access key with a pending key authorization, retrying the fill without the authorization when the chain has already registered the key.
