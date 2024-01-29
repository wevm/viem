import * as cKzg from 'c-kzg'
import { expect, test } from 'vitest'

import { trustedSetupPath } from '../../../test/src/kzg.js'
import { setupKzg } from './setupKzg.js'

test('setupKzg', () => {
  const kzg = setupKzg(trustedSetupPath, cKzg)

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
      "verifyBlobKzgProofBatch": [Function],
    }
  `)
})
