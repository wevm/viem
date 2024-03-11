import { expect, test } from 'vitest'
import { blobData, kzg } from '../../../test/src/kzg.js'
import { stringToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { commitmentsToVersionedHashes } from './commitmentsToVersionedHashes.js'
import { toBlobs } from './toBlobs.js'

test('from hex', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(commitmentsToVersionedHashes({ commitments })).toMatchInlineSnapshot(
    `
    [
      "0x012580b7683c14cc7540be305587b0eec4e7ec739094213ca080e2526c9237c4",
      "0x01243c18a024c835cce144b3b6b0eb878b7820c7c7b7d9feff80080d76519c45",
    ]
  `,
  )

  expect(
    commitmentsToVersionedHashes({ commitments, to: 'bytes' }),
  ).toMatchInlineSnapshot(
    `
    [
      Uint8Array [
        1,
        37,
        128,
        183,
        104,
        60,
        20,
        204,
        117,
        64,
        190,
        48,
        85,
        135,
        176,
        238,
        196,
        231,
        236,
        115,
        144,
        148,
        33,
        60,
        160,
        128,
        226,
        82,
        108,
        146,
        55,
        196,
      ],
      Uint8Array [
        1,
        36,
        60,
        24,
        160,
        36,
        200,
        53,
        204,
        225,
        68,
        179,
        182,
        176,
        235,
        135,
        139,
        120,
        32,
        199,
        199,
        183,
        217,
        254,
        255,
        128,
        8,
        13,
        118,
        81,
        156,
        69,
      ],
    ]
  `,
  )
})

test('from bytes', () => {
  const blobs = toBlobs({ data: stringToBytes(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(commitmentsToVersionedHashes({ commitments })).toMatchInlineSnapshot(
    `
    [
      Uint8Array [
        1,
        37,
        128,
        183,
        104,
        60,
        20,
        204,
        117,
        64,
        190,
        48,
        85,
        135,
        176,
        238,
        196,
        231,
        236,
        115,
        144,
        148,
        33,
        60,
        160,
        128,
        226,
        82,
        108,
        146,
        55,
        196,
      ],
      Uint8Array [
        1,
        36,
        60,
        24,
        160,
        36,
        200,
        53,
        204,
        225,
        68,
        179,
        182,
        176,
        235,
        135,
        139,
        120,
        32,
        199,
        199,
        183,
        217,
        254,
        255,
        128,
        8,
        13,
        118,
        81,
        156,
        69,
      ],
    ]
  `,
  )

  expect(
    commitmentsToVersionedHashes({ commitments, to: 'hex' }),
  ).toMatchInlineSnapshot(
    `
    [
      "0x012580b7683c14cc7540be305587b0eec4e7ec739094213ca080e2526c9237c4",
      "0x01243c18a024c835cce144b3b6b0eb878b7820c7c7b7d9feff80080d76519c45",
    ]
  `,
  )
})

test('args: version', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(
    commitmentsToVersionedHashes({ commitments, version: 2 }),
  ).toMatchInlineSnapshot(`
    [
      "0x022580b7683c14cc7540be305587b0eec4e7ec739094213ca080e2526c9237c4",
      "0x02243c18a024c835cce144b3b6b0eb878b7820c7c7b7d9feff80080d76519c45",
    ]
  `)
})

test('args: to', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(
    commitmentsToVersionedHashes({ commitments, to: 'bytes', version: 2 }),
  ).toMatchInlineSnapshot(`
    [
      Uint8Array [
        2,
        37,
        128,
        183,
        104,
        60,
        20,
        204,
        117,
        64,
        190,
        48,
        85,
        135,
        176,
        238,
        196,
        231,
        236,
        115,
        144,
        148,
        33,
        60,
        160,
        128,
        226,
        82,
        108,
        146,
        55,
        196,
      ],
      Uint8Array [
        2,
        36,
        60,
        24,
        160,
        36,
        200,
        53,
        204,
        225,
        68,
        179,
        182,
        176,
        235,
        135,
        139,
        120,
        32,
        199,
        199,
        183,
        217,
        254,
        255,
        128,
        8,
        13,
        118,
        81,
        156,
        69,
      ],
    ]
  `)
})
