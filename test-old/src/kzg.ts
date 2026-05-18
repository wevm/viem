import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { trustedSetup as fastSetup } from '@paulmillr/trusted-setups/fast.js'
import { KZG } from 'micro-eth-signer/kzg'
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
})

export const blobData = readFileSync(
  resolve(__dirname, '../kzg/lorem-ipsum.txt'),
  'utf-8',
)
