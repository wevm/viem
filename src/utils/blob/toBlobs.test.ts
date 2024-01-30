import { expect, test } from 'vitest'
import { stringToBytes, stringToHex } from '../index.js'
import { toBlobs } from './toBlobs.js'

test('default', () => {
  expect(
    toBlobs({ data: stringToHex('we are all gonna make it'.repeat(10000)) }),
  ).toMatchSnapshot()
  expect(
    toBlobs({
      data: stringToHex('we are all gonna make it'.repeat(10000)),
      to: 'bytes',
    }),
  ).toMatchSnapshot()
  expect(
    toBlobs({ data: stringToBytes('we are all gonna make it'.repeat(10000)) }),
  ).toMatchSnapshot()
  expect(
    toBlobs({
      data: stringToBytes('we are all gonna make it'.repeat(10000)),
      to: 'hex',
    }),
  ).toMatchSnapshot()
})

test('error: empty blob data', () => {
  expect(() =>
    toBlobs({ data: stringToHex('') }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [EmptyBlobError: Blob data must not be empty.

    Version: viem@1.0.2]
  `,
  )
})

test('error: blob data too big', () => {
  expect(() =>
    toBlobs({ data: stringToHex('we are all gonna make it'.repeat(20000)) }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BlobSizeTooLarge: Blob size is too large.

    Max: 262143 bytes
    Given: 480000 bytes

    Version: viem@1.0.2]
  `)
})
