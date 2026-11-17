---
"viem": patch
---

Sped up OP Stack `Actions.l1.getWithdrawalStatus` by reading the dispute game and the finalized state concurrently with the proof submitter.
