---
"viem": major
---

Blob construction, commitment, proof, and versioned-hash helpers moved from flat exports to the `Blobs` and `BlobCells` namespaces.

```diff
-import { blobsToCommitments, blobsToProofs, commitmentsToVersionedHashes, toBlobs } from 'viem'
+import { BlobCells, Blobs } from 'viem'
 
-const blobs = toBlobs({ data })
-const commitments = blobsToCommitments({ blobs, kzg })
-const proofs = blobsToProofs({ blobs, commitments, kzg })
-const versionedHashes = commitmentsToVersionedHashes({ commitments })
+const blobs = Blobs.from(data)
+const commitments = Blobs.toCommitments(blobs, { kzg })
+const proofs = Blobs.toCellProofs(blobs, { kzg })
+const versionedHashes = Blobs.commitmentsToVersionedHashes(commitments)
+const cells = BlobCells.fromBlob(blobs[0], { kzg })
```

KZG setup moved from the flat `setupKzg` helper to the `Kzg` namespace.

```diff
-import { setupKzg } from 'viem'
+import { Kzg } from 'viem'
 
-const kzg = setupKzg(cKzg, trustedSetup)
+const kzg = Kzg.from(cKzg)
```
