---
"viem": patch
---

Added `multicall3` contract address to `hyperEvm` chain definition. Multicall3 is deployed at the canonical address `0xcA11bde05977b3631167028862bE2a173976CA11` on HyperEVM (verified on [hyperevmscan.io](https://hyperevmscan.io/address/0xcA11bde05977b3631167028862bE2a173976CA11)), enabling automatic `eth_call` batching via `multicall` and wagmi's read batching.
