import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
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
  const data = stringToHex(
    readFileSync(
      resolve(__dirname, '../../../test/kzg/lorem-ipsum.txt'),
      'utf-8',
    ),
  )
  const blobs = toBlobs({
    data,
  })
  expect(
    fromBlobs({
      blobs,
    }),
  ).toEqual(data)
})
