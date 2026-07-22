import { expect, test } from 'vitest'
import { blobData } from '~test/kzg.js'
import {
  bytesPerFieldElement,
  fieldElementsPerBlob,
} from '../../constants/blob.js'
import { stringToHex } from '../encoding/toHex.js'
import { fromBlobs } from './fromBlobs.js'
import { toBlobs } from './toBlobs.js'

const dataBytesPerBlob = fieldElementsPerBlob * (bytesPerFieldElement - 1)

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

test('https://github.com/wevm/viem/issues/1986', () => {
  const data = new Uint8Array([1, 2, 128, 3, 4, 5, 6, 7, 8, 9, 10])
  const blobs = toBlobs({ data })
  expect(fromBlobs({ blobs: blobs })).toEqual(data)
})

test('round-trip: full blob ending in a 0x80 data byte', () => {
  const data = new Uint8Array(dataBytesPerBlob).fill(1)
  data[dataBytesPerBlob - 1] = 0x80
  const blobs = toBlobs({ data })
  expect(fromBlobs({ blobs })).toEqual(data)
})

test('round-trip: full blob ending in a 0x80 data byte, then another blob', () => {
  const data = new Uint8Array(dataBytesPerBlob + 100).fill(1)
  data[dataBytesPerBlob - 1] = 0x80
  const blobs = toBlobs({ data })
  expect(fromBlobs({ blobs })).toEqual(data)
})
