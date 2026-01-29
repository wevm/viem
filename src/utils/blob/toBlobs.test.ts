import { expect, test } from 'vitest'
import { blobData } from '../../../test/src/kzg.js'
import { stringToBytes, stringToHex } from '../index.js'
import { fromBlobs } from './fromBlobs.js'
import { toBlobs } from './toBlobs.js'

test('default', () => {
  const data_hex = stringToHex(blobData)
  const blobs_hex = toBlobs({ data: data_hex })
  expect(fromBlobs({ blobs: blobs_hex })).toEqual(data_hex)

  const data_bytes = stringToBytes(blobData)
  const blobs_bytes = toBlobs({ data: data_hex, to: 'bytes' })
  expect(fromBlobs({ blobs: blobs_bytes })).toEqual(data_bytes)

  const blobs_bytes_2 = toBlobs({ data: data_bytes })
  expect(fromBlobs({ blobs: blobs_bytes_2 })).toEqual(data_bytes)

  const blobs_hex_2 = toBlobs({ data: data_bytes, to: 'hex' })
  expect(fromBlobs({ blobs: blobs_hex_2 })).toEqual(data_hex)
})

test('error: empty blob data', () => {
  expect(() =>
    toBlobs({ data: stringToHex('') }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [EmptyBlobError: Blob data must not be empty.

    Version: viem@x.y.z]
  `,
  )
})

test('error: blob data too big', () => {
  expect(() =>
    toBlobs({ data: stringToHex('we are all gonna make it'.repeat(100000)) }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BlobSizeTooLargeError: Blob size is too large.

    Max: 761855 bytes
    Given: 2400000 bytes

    Version: viem@x.y.z]
  `)
})
