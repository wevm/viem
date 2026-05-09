import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

import { kzg } from '~test/kzg.js'
import { hexToBytes } from '../index.js'

const blobToKzgCommitmentCases = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../test/kzg/blob-to-kzg-commitment.json'),
    'utf8',
  ),
)
const computeBlobKzgProofCases = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../test/kzg/compute-blob-kzg-proof.json'),
    'utf8',
  ),
)

describe('blobToKzgCommitment', () => {
  for (const data of blobToKzgCommitmentCases) {
    test(data.name, () => {
      if (data.output === null)
        expect(() =>
          Uint8Array.from(kzg.blobToKzgCommitment(hexToBytes(data.input.blob))),
        ).toThrowError()
      else
        expect(
          Uint8Array.from(kzg.blobToKzgCommitment(hexToBytes(data.input.blob))),
        ).toEqual(hexToBytes(data.output))
    })
  }
})

describe('computeBlobKzgProof', () => {
  for (const data of computeBlobKzgProofCases) {
    test(data.name, () => {
      if (data.output === null)
        expect(() =>
          Uint8Array.from(
            kzg.computeBlobKzgProof(
              hexToBytes(data.input.blob),
              hexToBytes(data.input.commitment),
            ),
          ),
        ).toThrowError()
      else
        expect(
          Uint8Array.from(
            kzg.computeBlobKzgProof(
              hexToBytes(data.input.blob),
              hexToBytes(data.input.commitment),
            ),
          ),
        ).toEqual(hexToBytes(data.output))
    })
  }
})
