import { expect, test } from 'vitest'

import { mainnetTrustedSetupPath } from '../../node/index.js'
import { setupKzg } from './setupKzg.js'

test('setupKzg', () => {
  const kzg = setupKzg(
    {
      loadTrustedSetup() {},
      blobToKzgCommitment() {
        return new Uint8Array()
      },
      computeBlobKzgProof() {
        return new Uint8Array()
      },
    },
    mainnetTrustedSetupPath,
  )

  expect(kzg).toMatchInlineSnapshot(`
    {
      "blobToKzgCommitment": [Function],
      "computeBlobKzgProof": [Function],
    }
  `)
})
