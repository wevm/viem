---
"viem": minor
---

Added EntryPoint v0.9 support for Account Abstraction (ERC-4337).

**Features:**
- Added `entryPoint09Abi` and `entryPoint09Address` constants
- Added `'0.9'` to `EntryPointVersion` type
- Added `UserOperation<'0.9'>` with new `paymasterSignature` field for parallelizable paymaster signing
- Updated `getUserOperationHash` to support v0.9 (uses EIP-712 typed data like v0.8)
- Updated `toPackedUserOperation` to handle `paymasterSignature`
- Updated `prepareUserOperation` type definitions for v0.9
