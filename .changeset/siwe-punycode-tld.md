---
"viem": patch
---

Fixed `createSiweMessage` rejecting domains with a punycode (internationalized) top-level domain, such as `example.xn--p1ai`.
