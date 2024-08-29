import { expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { hashAuthorization } from './hashAuthorization.js'

test('default', () => {
  expect(
    hashAuthorization({
      contractAddress: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
      chainId: 1,
      nonce: 40,
    }),
  ).toMatchInlineSnapshot(
    `"0x5919da563810a99caf657d42bd10905adbd28b3b89b8a4577efa471e5e4b3914"`,
  )

  expect(
    hashAuthorization({
      chainId: 69,
      contractAddress: wagmiContractConfig.address,
      nonce: 420,
    }),
  ).toMatchInlineSnapshot(
    `"0x9aeacccc1b8571dfc4fb4ba734dbde6e94d6c0188484413585144a755c359aac"`,
  )
})

test('args: to', () => {
  expect(
    hashAuthorization({
      chainId: 1,
      contractAddress: wagmiContractConfig.address,
      nonce: 0,
      to: 'bytes',
    }),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      144,
      51,
      238,
      19,
      215,
      246,
      3,
      204,
      179,
      170,
      41,
      75,
      60,
      94,
      113,
      124,
      15,
      193,
      57,
      102,
      229,
      8,
      229,
      140,
      203,
      54,
      237,
      73,
      228,
      251,
      177,
      230,
    ]
  `,
  )

  expect(
    hashAuthorization({
      chainId: 69,
      contractAddress: wagmiContractConfig.address,
      nonce: 420,
      to: 'bytes',
    }),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      154,
      234,
      204,
      204,
      27,
      133,
      113,
      223,
      196,
      251,
      75,
      167,
      52,
      219,
      222,
      110,
      148,
      214,
      192,
      24,
      132,
      132,
      65,
      53,
      133,
      20,
      74,
      117,
      92,
      53,
      154,
      172,
    ]
  `,
  )
})
