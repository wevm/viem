---
"viem": patch
---

`waitForTransactionReceipt`: Added a `transactionReplacement` chain config hook for chain-specific replacement semantics, and stopped searching for replacements of already-mined transactions. `viem/tempo` uses the hook so that Tempo transactions are only replaced within their nonce slot: `(nonceKey, nonce)` for protocol and 2D nonces, or the expiring nonce hash for expiring nonces. Replacement reasons now compare `calls`. Previously a wait could resolve to an earlier expiring-nonce transaction's receipt.
