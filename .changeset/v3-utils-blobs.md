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

KZG setup moved from the flat `setupKzg` and `defineKzg` helpers to the `Kzg` namespace. The `Kzg` interface adopted [EIP-7594](https://eips.ethereum.org/EIPS/eip-7594) cell methods in place of `computeBlobKzgProof`.

```diff
-import { defineKzg, setupKzg } from 'viem'
+import { Kzg } from 'viem'
 
-const kzg = setupKzg(cKzg, trustedSetup)
-const kzg = defineKzg(cKzg)
+const kzg = Kzg.from(cKzg)
```

Blob decoding moved from `fromBlobs` to `Blobs.to`.

```diff
-import { fromBlobs } from 'viem'
+import { Blobs } from 'viem'

-const data = fromBlobs({ blobs, to: 'hex' })
+const data = Blobs.to(blobs, 'Hex')
```

The per-blob sidecar surface was redesigned for [EIP-7594](https://eips.ethereum.org/EIPS/eip-7594) (PeerDAS): `BlobSidecar`/`BlobSidecars` (array of `{ blob, commitment, proof }`) became the struct-of-arrays `TxEnvelopeEip4844.Sidecars` carrying cell proofs, and `toBlobSidecars`/`sidecarsToVersionedHashes` were removed — sidecars are attached automatically when passing `blobs` + `kzg` to `Actions.transaction.prepare`/`send` or `TransactionRequest.toEnvelope`.

```diff
-import { sidecarsToVersionedHashes, toBlobSidecars, type BlobSidecars } from 'viem'
+import { Blobs, type TxEnvelopeEip4844 } from 'viem'

-const sidecars = toBlobSidecars({ blobs, kzg })
-const versionedHashes = sidecarsToVersionedHashes({ sidecars })
+// Sidecars are built during transaction preparation:
+// Actions.transaction.send(client, { blobs, kzg, ... })
+const versionedHashes = Blobs.commitmentsToVersionedHashes(sidecars.commitments)

- type Sidecars = BlobSidecars
+ type Sidecars = TxEnvelopeEip4844.Sidecars
```
