---
"viem": patch
---

`viem/tempo`: Changed `Relay.simulate` to return `balanceDiffs` only for requests with `capabilities.balanceDiffs: true`, report same-token incoming and outgoing transfers separately, measure approval exposure as the allowance left after the calls, and read ERC-20 metadata for non-TIP-20 tokens.
