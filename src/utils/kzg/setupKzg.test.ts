import * as cKzg from 'c-kzg'
import { expect, test } from 'vitest'

import { mainnetTrustedSetupPath } from '../../node/index.js'
import { setupKzg } from './setupKzg.js'

test('setupKzg', () => {
  const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
    }
  `)
})
