import { expect, test } from 'vitest'
import { stringToBytes, stringToHex } from '../index.js'
import { toBlobs } from './toBlobs.js'

test('default', () => {
  expect(
    toBlobs(stringToHex('we are all gonna make it'.repeat(10000))),
  ).toMatchSnapshot()
  expect(
    toBlobs(stringToHex('we are all gonna make it'.repeat(10000)), 'bytes'),
  ).toMatchSnapshot()
  expect(
    toBlobs(stringToBytes('we are all gonna make it'.repeat(10000))),
  ).toMatchSnapshot()
  expect(
    toBlobs(stringToBytes('we are all gonna make it'.repeat(10000)), 'hex'),
  ).toMatchSnapshot()
})

test('error: empty blob data', () => {
  expect(() => toBlobs(stringToHex(''))).toThrowErrorMatchingInlineSnapshot(
    `
    [EmptyBlobError: Blob data must not be empty.

    Version: viem@1.0.2]
  `,
  )
})

test('error: blob data too big', () => {
  expect(() =>
    toBlobs(stringToHex('we are all gonna make it'.repeat(20000))),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BlobSizeTooLarge: Blob size is too large.

    Max: 262143 bytes
    Given: 480000 bytes

    Version: viem@1.0.2]
  `)
})
