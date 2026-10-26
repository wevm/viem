---
"viem": patch
---

Fixed `createSiweMessage` rejecting domains with a punycode (internationalized) top-level domain, such as `example.xn--p1ai`, and accepting top-level domain labels longer than 63 characters.
