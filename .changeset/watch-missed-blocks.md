---
"viem": patch
---

Fixed `watchBlocks` and `watchBlockNumber` skipping blocks over HTTP on fast chains such as Monad and Arbitrum, and `watchBlocks` falling behind while it caught up on missed blocks.
