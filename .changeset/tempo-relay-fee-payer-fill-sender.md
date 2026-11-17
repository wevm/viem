---
"viem": patch
---

Fixed `Relay.feePayer` to validate, bind, and sign for one sender, rejecting a fill whose sender or key authorization account differs from the request.
