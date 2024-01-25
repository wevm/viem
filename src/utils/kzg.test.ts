import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as cKzg from 'c-kzg'
import { describe, expect, test } from 'vitest'

import { hexToBytes } from './index.js'
import { type Kzg, defineKzg, setupKzg } from './kzg.js'

const blobToKzgCommitmentCases = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../test/kzg/blob-to-kzg-commitment.json'),
    'utf8',
  ),
)
const trustedSetupPath = resolve(__dirname, '../../test/kzg/trusted_setup.txt')

let kzg: Kzg

test('defineKzg', () => {
  cKzg.loadTrustedSetup(trustedSetupPath)
  const kzg = defineKzg(cKzg)

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
      "verifyBlobKzgProofBatch": [Function],
      "verifyKzgProof": [Function],
    }
  `)
})

test('setupKzg', () => {
  kzg = setupKzg(trustedSetupPath, cKzg)

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
      "verifyBlobKzgProofBatch": [Function],
      "verifyKzgProof": [Function],
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
