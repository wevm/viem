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

  expect(
    hashAuthorization({
      contractAddress: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
      chainId: 0,
      nonce: 0,
    }),
  ).toMatchInlineSnapshot(
    `"0x70f22b957bc18cbaa757a12cc3e5fa5268b98b24afe15a35a76e6874748a8bfa"`,
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
      163,
      87,
      188,
      177,
      246,
      158,
      136,
      210,
      193,
      112,
      144,
      74,
      24,
      188,
      91,
      184,
      254,
      37,
      135,
      41,
      35,
      168,
      208,
      169,
      47,
      62,
      87,
      194,
      214,
      223,
      53,
      203,
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
