---
"viem": patch
---

Changed `Relay.simulate` balance diffs and `Relay.autoSwap` swaps to require request opt-in through `capabilities.balanceDiffs: true` and `capabilities.autoSwap`; fee estimates stay default.
