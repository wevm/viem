import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as cKzg from 'c-kzg'
import { describe, expect, test } from 'vitest'

import { trustedSetupPath } from '../../../test/src/kzg.js'
import type { Kzg } from '../../types/kzg.js'
import { hexToBytes } from '../index.js'
import { defineKzg } from './defineKzg.js'

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
const verifyBlobKzgProofBatchCases = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../test/kzg/verify-blob-kzg-proof-batch.json'),
    'utf8',
  ),
)

let kzg: Kzg

test('defineKzg', () => {
  cKzg.loadTrustedSetup(trustedSetupPath)
  kzg = defineKzg(cKzg)

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
      "verifyBlobKzgProofBatch": [Function],
    }
  `)
})

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

describe('verifyBlobKzgProofBatch', () => {
  for (const data of verifyBlobKzgProofBatchCases) {
    test(data.name, () => {
      if (data.output === null)
        expect(() =>
          kzg.verifyBlobKzgProofBatch(
            data.input.blobs.map((b: any) => hexToBytes(b)),
            data.input.commitments.map((c: any) => hexToBytes(c)),
            data.input.proofs.map((p: any) => hexToBytes(p)),
          ),
        ).toThrowError()
      else
        expect(
          kzg.verifyBlobKzgProofBatch(
            data.input.blobs.map((b: any) => hexToBytes(b)),
            data.input.commitments.map((c: any) => hexToBytes(c)),
            data.input.proofs.map((p: any) => hexToBytes(p)),
          ),
        ).toEqual(data.output)
    })
  }
})
