---
"viem": patch
---

Added the `onRejected` option to `Relay.feePayer`, called when a node rejects a sponsored raw broadcast whose fee cap is below the protocol base-fee floor.
