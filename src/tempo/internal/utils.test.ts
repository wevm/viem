import { describe, expect, test } from 'vitest'
import { isTip20 } from './utils.js'

describe('isTip20', () => {
  test('requires the full 12-byte TIP-20 prefix', () => {
    expect(
      [
        '0x20c0000000000000000000000000000000000000',
        '0x20c000000000000000000000b9537d11c60e8b50',
        '0x20C000000000000000000000B9537D11C60E8B50',
        `0x20c0${'ab'.repeat(18)}`,
        '0x20c0000000000000000000010000000000000000',
        '0x20c1000000000000000000000000000000000000',
        `0x${'aa'.repeat(20)}`,
        undefined,
      ].map((address) => [address, isTip20(address)]),
    ).toMatchInlineSnapshot(`
      [
        [
          "0x20c0000000000000000000000000000000000000",
          true,
        ],
        [
          "0x20c000000000000000000000b9537d11c60e8b50",
          true,
        ],
        [
          "0x20C000000000000000000000B9537D11C60E8B50",
          true,
        ],
        [
          "0x20c0abababababababababababababababababab",
          false,
        ],
        [
          "0x20c0000000000000000000010000000000000000",
          false,
        ],
        [
          "0x20c1000000000000000000000000000000000000",
          false,
        ],
        [
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          false,
        ],
        [
          undefined,
          false,
        ],
      ]
    `)
  })
})
