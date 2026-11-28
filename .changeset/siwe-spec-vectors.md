---
"viem": patch
---

Aligned SIWE utilities with EIP-4361 and the spruceid test vectors: `parseSiweMessage` and `createSiweMessage` accepted userinfo and IP-literal domains, `parseSiweMessage` rejected text after the last field and invalid calendar dates and kept an empty statement or Request ID, `isUri` rejected malformed IP-literal hosts, `validateSiweMessage` rejected an invalid `uri`, resource, or `issuedAt`, and `createSiweMessage` rejected a missing `nonce`.
