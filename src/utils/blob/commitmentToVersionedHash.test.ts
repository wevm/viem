import { expect, test } from 'vitest'
import { kzg } from '../../../test/src/kzg.js'
import { hexToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { commitmentToVersionedHash } from './commitmentToVersionedHash.js'
import { toBlobs } from './toBlobs.js'

test('default', () => {
  const blobs = toBlobs({ data: stringToHex('abcd'.repeat(50000)) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(
    commitmentToVersionedHash({ commitment: commitments[0] }),
  ).toMatchInlineSnapshot(
    `"0x018666e86e22755cadfd12c1f58facc8a8c7d9550a02af8bc7e38a3d3aec0a9d"`,
  )
  expect(
    commitmentToVersionedHash({ commitment: commitments[1], to: 'bytes' }),
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
    commitmentToVersionedHash({
      commitment: hexToBytes(commitments[0]),
      to: 'hex',
      version: 69,
    }),
  ).toMatchInlineSnapshot(
    `"0x458666e86e22755cadfd12c1f58facc8a8c7d9550a02af8bc7e38a3d3aec0a9d"`,
  )
  expect(
    commitmentToVersionedHash({
      commitment: hexToBytes(commitments[1]),
      version: 69,
    }),
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

test('args: version', () => {
  const blobs = toBlobs({ data: stringToHex('abcd'.repeat(50000)) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(
    commitmentToVersionedHash({ commitment: commitments[0], version: 69 }),
  ).toMatchInlineSnapshot(
    `"0x458666e86e22755cadfd12c1f58facc8a8c7d9550a02af8bc7e38a3d3aec0a9d"`,
  )
})

test('args: to', () => {
  const blobs = toBlobs({ data: stringToHex('abcd'.repeat(50000)) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(
    commitmentToVersionedHash({
      commitment: commitments[0],
      version: 69,
      to: 'bytes',
    }),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      69,
      134,
      102,
      232,
      110,
      34,
      117,
      92,
      173,
      253,
      18,
      193,
      245,
      143,
      172,
      200,
      168,
      199,
      217,
      85,
      10,
      2,
      175,
      139,
      199,
      227,
      138,
      61,
      58,
      236,
      10,
      157,
    ]
  `,
  )
})
