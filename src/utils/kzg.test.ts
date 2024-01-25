import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  blobToKzgCommitment,
  computeBlobKzgProof,
  loadTrustedSetup,
  verifyBlobKzgProofBatch,
  verifyKzgProof,
} from 'c-kzg'
import { expect, test } from 'vitest'

import { hexToBytes } from './index.js'
import { createKzg } from './kzg.js'

const blobCommitments = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../test/kzg/blob-commitments.json'),
    'utf8',
  ),
)

test('default', () => {
  loadTrustedSetup(resolve(__dirname, '../../test/kzg/trusted_setup.txt'))
  const kzg = createKzg({
    blobToKzgCommitment,
    computeBlobKzgProof,
    verifyBlobKzgProofBatch,
    verifyKzgProof,
  })

  expect(
    Uint8Array.from(
      kzg.blobToKzgCommitment(hexToBytes(blobCommitments[0].blob)),
    ),
  ).toEqual(hexToBytes(blobCommitments[0].commitment))

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
      "verifyBlobKzgProofBatch": [Function],
      "verifyKzgProof": [Function],
    }
  `)
})
