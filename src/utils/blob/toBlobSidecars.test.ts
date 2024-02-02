import { expect, test } from 'vitest'
import { kzg } from '../../../test/src/kzg.js'
import { stringToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { blobsToProofs } from './blobsToProofs.js'
import { toBlobSidecars } from './toBlobSidecars.js'
import { toBlobs } from './toBlobs.js'

test('args: data', () => {
  expect(
    toBlobSidecars({
      data: stringToHex('abcd'),
      kzg,
    }),
  ).toMatchSnapshot()
})

test('args: blobs, commitments, proofs', () => {
  const blobs = toBlobs({ data: stringToHex('abcd') })
  const commitments = blobsToCommitments({ blobs, kzg })
  const proofs = blobsToProofs({ blobs, commitments, kzg })
  expect(
    toBlobSidecars({
      blobs,
      commitments,
      proofs,
    }),
  ).toMatchSnapshot()
})

test('args: to', () => {
  expect(
    toBlobSidecars({
      data: stringToBytes('abcd'),
      kzg,
    }),
  ).toMatchSnapshot()
  expect(
    toBlobSidecars({
      data: stringToHex('abcd'),
      kzg,
      to: 'bytes',
    }),
  ).toMatchSnapshot()
  expect(
    toBlobSidecars({
      data: stringToBytes('abcd'),
      kzg,
      to: 'hex',
    }),
  ).toMatchSnapshot()
})
