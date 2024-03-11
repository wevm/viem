import { expect, test } from 'vitest'
import { blobData } from '../../../test/src/kzg.js'
import { stringToHex } from '../encoding/toHex.js'
import { fromBlobs } from './fromBlobs.js'
import { toBlobs } from './toBlobs.js'

test('default', () => {
  const data = stringToHex('we are all gonna make it'.repeat(5))
  const blobs = toBlobs({
    data,
  })
  expect(
    fromBlobs({
      blobs,
    }),
  ).toEqual(data)
})

test('large', () => {
  const blobs = toBlobs({
    data: stringToHex(blobData),
  })
  expect(
    fromBlobs({
      blobs,
    }),
  ).toEqual(stringToHex(blobData))
})
