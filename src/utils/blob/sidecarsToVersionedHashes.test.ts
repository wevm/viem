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
      "0x016ca9369255f5810ee193a3ffc23cf8c0336d207f551011c5d88615832dc361",
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
        108,
        169,
        54,
        146,
        85,
        245,
        129,
        14,
        225,
        147,
        163,
        255,
        194,
        60,
        248,
        192,
        51,
        109,
        32,
        127,
        85,
        16,
        17,
        197,
        216,
        134,
        21,
        131,
        45,
        195,
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
        108,
        169,
        54,
        146,
        85,
        245,
        129,
        14,
        225,
        147,
        163,
        255,
        194,
        60,
        248,
        192,
        51,
        109,
        32,
        127,
        85,
        16,
        17,
        197,
        216,
        134,
        21,
        131,
        45,
        195,
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
            "0x016ca9369255f5810ee193a3ffc23cf8c0336d207f551011c5d88615832dc361",
          ]
        `)
})
