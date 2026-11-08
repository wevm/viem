---
"viem": patch
---

Fixed `Actions.block.watch` and `Actions.block.watchNumber` skipping blocks over HTTP on fast chains such as Monad and Arbitrum, and `Actions.block.watch` falling behind while it caught up on missed blocks.
