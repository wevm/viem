import { expect, test } from 'vitest'
import { kzg } from '../../../test/src/kzg.js'
import { stringToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { commitmentsToVersionedHashes } from './commitmentsToVersionedHashes.js'
import { toBlobs } from './toBlobs.js'

test('from hex', () => {
  const blobs = toBlobs(stringToHex('abcd'.repeat(50000)))
  const commitments = blobsToCommitments(blobs, kzg)

  expect(commitmentsToVersionedHashes({ commitments })).toMatchInlineSnapshot(
    `
    [
      "0x018666e86e22755cadfd12c1f58facc8a8c7d9550a02af8bc7e38a3d3aec0a9d",
      "0x019cdd013c6f27f86b959b251a97bb7207d2ad079b6998c1c244b6514600bb04",
    ]
  `,
  )

  expect(
    commitmentsToVersionedHashes({ commitments }, 'bytes'),
  ).toMatchInlineSnapshot(
    `
    [
      Uint8Array [
        1,
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
      ],
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
      ],
    ]
  `,
  )
})

test('from bytes', () => {
  const blobs = toBlobs(stringToBytes('abcd'.repeat(50000)))
  const commitments = blobsToCommitments(blobs, kzg)

  expect(commitmentsToVersionedHashes({ commitments })).toMatchInlineSnapshot(
    `
    [
      Uint8Array [
        1,
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
      ],
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
      ],
    ]
  `,
  )

  expect(
    commitmentsToVersionedHashes({ commitments }, 'hex'),
  ).toMatchInlineSnapshot(
    `
    [
      "0x018666e86e22755cadfd12c1f58facc8a8c7d9550a02af8bc7e38a3d3aec0a9d",
      "0x019cdd013c6f27f86b959b251a97bb7207d2ad079b6998c1c244b6514600bb04",
    ]
  `,
  )
})
