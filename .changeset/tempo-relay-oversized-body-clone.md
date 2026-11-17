---
"viem": patch
---

Fixed `Relay.create(...).fetch` never answering a request over 16 MiB while a clone of the request body was unread.
