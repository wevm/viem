import { resolve } from 'node:path'
import * as cKzg from 'c-kzg'
import { expect, test } from 'vitest'

import { setupKzg } from './setupKzg.js'

const trustedSetupPath = resolve(
  __dirname,
  '../../../test/kzg/trusted_setup.txt',
)

test('setupKzg', () => {
  const kzg = setupKzg(trustedSetupPath, cKzg)

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
      "verifyBlobKzgProofBatch": [Function],
      "verifyKzgProof": [Function],
    }
  `)
})
