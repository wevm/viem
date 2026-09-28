---
"viem": minor
---

`viem/tempo`: Unified access key authorization results into `{ rootAddress, keyAuthorization, hash }`, with `hash` undefined for wallet authorization.

```diff
- const hash = await client.accessKey.authorize({ accessKey, expiry })
+ const { rootAddress, keyAuthorization, hash } = await client.accessKey.authorize({ accessKey, expiry })
```
