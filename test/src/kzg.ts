import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { trustedSetup as fastSetup } from '@paulmillr/trusted-setups/fast-peerdas.js'

import { KZG } from 'micro-eth-signer/advanced/kzg.js'
import { bytesToHex, defineKzg, hexToBytes } from '../../src/index.js'

const k = new KZG(fastSetup)
export const kzg = defineKzg({
  blobToKzgCommitment(blob) {
    return hexToBytes(k.blobToKzgCommitment(bytesToHex(blob)) as `0x${string}`)
  },
  computeBlobKzgProof(blob, commitment) {
    return hexToBytes(
      k.computeBlobProof(
        bytesToHex(blob),
        bytesToHex(commitment),
      ) as `0x${string}`,
    )
  },
  computeCellsAndKzgProofs(blob) {
    const [cells, proofs] = k.computeCellsAndProofs(bytesToHex(blob)) as [
      `0x${string}`[],
      `0x${string}`[],
    ]
    return [
      cells.map((cell) => hexToBytes(cell)),
      proofs.map((proof) => hexToBytes(proof)),
    ]
  },
})

export const blobData = readFileSync(
  resolve(__dirname, '../kzg/lorem-ipsum.txt'),
  'utf-8',
)
