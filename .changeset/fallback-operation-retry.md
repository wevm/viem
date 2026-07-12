---
"viem": patch
---

Fixed `fallback` transport behavior for `sendTransaction`/`sendTransactionSync` with local accounts: the whole operation (nonce assignment, fee estimation, signing, submission) is now re-run against one transport at a time, so a transaction is no longer signed with chain state (e.g. a nonce) from one transport and broadcast through another. If a node explicitly rejects a submission (e.g. "nonce too low"), the next transport re-prepares and re-signs the transaction; if a submission fails ambiguously (e.g. a timeout), subsequent transports re-broadcast the same signed bytes to avoid double-sending.
