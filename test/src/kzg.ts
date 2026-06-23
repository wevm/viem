import { trustedSetup } from '@paulmillr/trusted-setups/fast-kzg.js'
import { KZG } from 'micro-eth-signer/advanced/kzg.js'
import * as Bytes from 'ox/Bytes'
import * as Kzg from 'ox/Kzg'

const k = new KZG(trustedSetup)

/** A KZG implementation (backed by `micro-eth-signer`) for EIP-4844 tests. */
export const kzg = Kzg.from({
  blobToKzgCommitment(blob) {
    return Bytes.fromHex(
      k.blobToKzgCommitment(Bytes.toHex(blob)) as `0x${string}`,
    )
  },
  computeCells(blob) {
    return k
      .computeCells(Bytes.toHex(blob))
      .map((cell) => Bytes.fromHex(cell as `0x${string}`))
  },
  computeCellsAndKzgProofs(blob) {
    const [cells, proofs] = k.computeCellsAndProofs(Bytes.toHex(blob))
    return {
      cells: cells.map((cell) => Bytes.fromHex(cell as `0x${string}`)),
      proofs: proofs.map((proof) => Bytes.fromHex(proof as `0x${string}`)),
    }
  },
  recoverCellsAndKzgProofs(cellIndices, cells) {
    const [recovered, proofs] = k.recoverCellsAndProofs(
      [...cellIndices],
      cells.map((cell) => Bytes.toHex(cell)),
    )
    return {
      cells: recovered.map((cell) => Bytes.fromHex(cell as `0x${string}`)),
      proofs: proofs.map((proof) => Bytes.fromHex(proof as `0x${string}`)),
    }
  },
  verifyCellKzgProofBatch(commitments, cellIndices, cells, proofs) {
    return k.verifyCellKzgProofBatch(
      commitments.map((commitment) => Bytes.toHex(commitment)),
      [...cellIndices],
      cells.map((cell) => Bytes.toHex(cell)),
      proofs.map((proof) => Bytes.toHex(proof)),
    )
  },
})
