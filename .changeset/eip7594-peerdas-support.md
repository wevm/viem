---
"viem": minor
---

Added EIP-7594 (PeerDAS) blob support.

**Breaking Changes**

`blobsToProofs` now returns an array of arrays (`ByteArray[][] | Hex[][]`) instead of a flat array. Each blob gets its own array of proofs to support EIP-7594's cell proofs (128 proofs per blob).

```ts
// Before (EIP-4844 only)
const proofs = blobsToProofs({ blobs, commitments, kzg })
// proofs = [proof1, proof2, ...]

// After (supports both EIP-4844 and EIP-7594)
const proofs = blobsToProofs({ blobs, commitments, kzg, blobVersion: '7594' })
// EIP-4844: proofs = [[proof1], [proof2], ...]
// EIP-7594: proofs = [[proof1, ...proof128], [proof129, ...proof256], ...]
```

**Features**

- Added EIP-7594 blob transaction support with 128 cell proofs per blob
- Automatic blob version detection based on chain ID (Sepolia uses EIP-7594)
- `parseTransaction` now handles 5-element EIP-7594 wrapper arrays with version byte
- `BlobSidecar.proof` type updated to support both single proof and proof arrays
- `serializeTransaction` correctly flattens proof arrays for both EIP standards

**Implementation**

- Updated `blobsToProofs` to use `computeCellsAndKzgProofs` for EIP-7594
- Enhanced `parseTransaction` to detect and parse EIP-7594 wrapper format
- Modified `toBlobSidecars` to handle variable-length proof arrays
- Added chain-based blob version detection (Sepolia = EIP-7594, others = EIP-4844)
