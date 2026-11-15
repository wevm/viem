---
"viem": patch
---

Generated `generateSiweNonce` nonces from `crypto.getRandomValues`, since consecutive nonces previously shared 95 of their 96 characters.
