---
"viem": patch
---

Fixed `createSiweMessage` accepting a `requestId` that contains a line break. The line break started a new field, so a request ID could append lines such as a `Resources` section to the signed message, which `parseSiweMessage` then read back; it now throws `SiweInvalidMessageFieldError`.
