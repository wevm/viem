---
'viem': patch
---

Allowed `extractEvent`/`extractEvents` and the OP Stack log extractors to decode partial logs, so EIP-5792 call receipts can be passed without a cast. Return types stay generic over the log passed in, so full logs keep their block and transaction metadata.
