---
"viem": patch
---

Fixed `getTypesForEIP712Domain` to include every domain field that is present (not `undefined` or `null`), so that a domain with a string `chainId` (e.g. from a JSON payload) is no longer hashed and signed without `chainId`.
