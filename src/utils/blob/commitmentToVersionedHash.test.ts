import { expect, test } from 'vitest'
import { blobData, kzg } from '../../../test/src/kzg.js'
import { hexToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { commitmentToVersionedHash } from './commitmentToVersionedHash.js'
import { toBlobs } from './toBlobs.js'

test('default', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(
    commitmentToVersionedHash({ commitment: commitments[0] }),
  ).toMatchInlineSnapshot(
    `"0x012580b7683c14cc7540be305587b0eec4e7ec739094213ca080e2526c9237c4"`,
  )
  expect(
    commitmentToVersionedHash({ commitment: commitments[1], to: 'bytes' }),
  ).toMatchInlineSnapshot(
    `
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
    `"0x452580b7683c14cc7540be305587b0eec4e7ec739094213ca080e2526c9237c4"`,
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
    ]
  `,
  )
})

test('args: version', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })

  expect(
    commitmentToVersionedHash({ commitment: commitments[0], version: 69 }),
  ).toMatchInlineSnapshot(
    `"0x452580b7683c14cc7540be305587b0eec4e7ec739094213ca080e2526c9237c4"`,
  )
})

test('args: to', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
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
    ]
  `,
  )
})
