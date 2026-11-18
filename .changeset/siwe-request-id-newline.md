---
"viem": patch
---

Fixed `createSiweMessage` accepting a `requestId` with a line break, which let it append fields such as `Resources` to the signed message; it now throws `SiweInvalidMessageFieldError`.
