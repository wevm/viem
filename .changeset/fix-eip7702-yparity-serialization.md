---
"viem": patch
---

Fixed `formatUserOperationRequest` serializing an EIP-7702 authorization `yParity` of `0` as a 32-byte value instead of a single byte. The malformed value was sent to both `pm_getPaymasterData` and `eth_sendUserOperation`, which could cause paymaster signature validation (`AA34`) to fail for 7702 User Operations.
