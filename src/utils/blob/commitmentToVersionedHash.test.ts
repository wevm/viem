import { expect, test } from 'vitest'
import { kzg } from '../../../test/src/kzg.js'
import { hexToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { commitmentToVersionedHash } from './commitmentToVersionedHash.js'
import { toBlobs } from './toBlobs.js'

test('default', () => {
  const blobs = toBlobs(stringToHex('abcd'.repeat(50000)))
  const commitments = blobsToCommitments(blobs, kzg)

  expect(
    commitmentToVersionedHash({
      commitment: commitments[0],
    }),
  ).toMatchInlineSnapshot(
    `"0x018666e86e22755cadfd12c1f58facc8a8c7d9550a02af8bc7e38a3d3aec0a9d"`,
  )
  expect(
    commitmentToVersionedHash({
      commitment: hexToBytes(commitments[1]),
    }),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      1,
      156,
      221,
      1,
      60,
      111,
      39,
      248,
      107,
      149,
      155,
      37,
      26,
      151,
      187,
      114,
      7,
      210,
      173,
      7,
      155,
      105,
      152,
      193,
      194,
      68,
      182,
      81,
      70,
      0,
      187,
      4,
    ]
  `,
  )

  expect(
    commitmentToVersionedHash(
      {
        commitment: hexToBytes(commitments[0]),
        version: 69,
      },
      'hex',
    ),
  ).toMatchInlineSnapshot(
    `"0x458666e86e22755cadfd12c1f58facc8a8c7d9550a02af8bc7e38a3d3aec0a9d"`,
  )
  expect(
    commitmentToVersionedHash(
      {
        commitment: commitments[1],
        version: 69,
      },
      'bytes',
    ),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      69,
      156,
      221,
      1,
      60,
      111,
      39,
      248,
      107,
      149,
      155,
      37,
      26,
      151,
      187,
      114,
      7,
      210,
      173,
      7,
      155,
      105,
      152,
      193,
      194,
      68,
      182,
      81,
      70,
      0,
      187,
      4,
    ]
  `,
  )
})
