import { expect, test } from 'vitest'
import { kzg } from '../../../test/src/kzg.js'
import { stringToBytes, stringToHex } from '../index.js'
import { sidecarsToVersionedHashes } from './sidecarsToVersionedHashes.js'
import { toBlobSidecars } from './toBlobSidecars.js'

test('default', () => {
  expect(
    sidecarsToVersionedHashes({
      sidecars: toBlobSidecars({
        data: stringToHex('abcd'),
        kzg,
      }),
    }),
  ).toMatchInlineSnapshot(`
    [
      "0x01627c687261b0e7f8638af1112efa8a77e23656f6e7945275b19e9deed80261",
    ]
  `)

  expect(
    sidecarsToVersionedHashes({
      sidecars: toBlobSidecars({
        data: stringToBytes('abcd'),
        kzg,
      }),
    }),
  ).toMatchInlineSnapshot(`
    [
      Uint8Array [
        1,
        98,
        124,
        104,
        114,
        97,
        176,
        231,
        248,
        99,
        138,
        241,
        17,
        46,
        250,
        138,
        119,
        226,
        54,
        86,
        246,
        231,
        148,
        82,
        117,
        177,
        158,
        157,
        238,
        216,
        2,
        97,
      ],
    ]
  `)
})

test('args: to', () => {
  expect(
    sidecarsToVersionedHashes({
      sidecars: toBlobSidecars({
        data: stringToHex('abcd'),
        kzg,
      }),
      to: 'bytes',
    }),
  ).toMatchInlineSnapshot(`
    [
      Uint8Array [
        1,
        98,
        124,
        104,
        114,
        97,
        176,
        231,
        248,
        99,
        138,
        241,
        17,
        46,
        250,
        138,
        119,
        226,
        54,
        86,
        246,
        231,
        148,
        82,
        117,
        177,
        158,
        157,
        238,
        216,
        2,
        97,
      ],
    ]
  `)

  expect(
    sidecarsToVersionedHashes({
      sidecars: toBlobSidecars({
        data: stringToBytes('abcd'),
        kzg,
      }),
      to: 'hex',
    }),
  ).toMatchInlineSnapshot(`
    [
      "0x01627c687261b0e7f8638af1112efa8a77e23656f6e7945275b19e9deed80261",
    ]
  `)
})
