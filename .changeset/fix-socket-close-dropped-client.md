---
"viem": patch
---

Fixed socket clients so that dropping a client that will not reconnect closes its socket, and a failed request is no longer reported again on later disconnects.
