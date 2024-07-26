import { expect, test } from 'vitest'
import { hashAuthorization } from './hashAuthorization.js'
import { wagmiContractConfig } from '../../../test/src/abis.js'

test('default', () => {
  expect(
    hashAuthorization({
      chainId: 1,
      address: wagmiContractConfig.address,
      nonce: 0,
    }),
  ).toMatchInlineSnapshot(
    `"0x0577f922e34993267c8431e431781ec252b3c398d8441499b6848a370c0c50eba5"`,
  )

  expect(
    hashAuthorization({
      chainId: 69,
      address: wagmiContractConfig.address,
      nonce: 420,
    }),
  ).toMatchInlineSnapshot(
    `"0x05b9d5bae0f3b34ec98b10dc78ff6204f07cb6daa6f797d46c594b9bd0a1b8ba53"`,
  )
})

test('args: to', () => {
  expect(
    hashAuthorization({
      chainId: 1,
      address: wagmiContractConfig.address,
      nonce: 0,
      to: 'bytes',
    }),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      5,
      119,
      249,
      34,
      227,
      73,
      147,
      38,
      124,
      132,
      49,
      228,
      49,
      120,
      30,
      194,
      82,
      179,
      195,
      152,
      216,
      68,
      20,
      153,
      182,
      132,
      138,
      55,
      12,
      12,
      80,
      235,
      165,
    ]
  `,
  )

  expect(
    hashAuthorization({
      chainId: 69,
      address: wagmiContractConfig.address,
      nonce: 420,
      to: 'bytes',
    }),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      5,
      185,
      213,
      186,
      224,
      243,
      179,
      78,
      201,
      139,
      16,
      220,
      120,
      255,
      98,
      4,
      240,
      124,
      182,
      218,
      166,
      247,
      151,
      212,
      108,
      89,
      75,
      155,
      208,
      161,
      184,
      186,
      83,
    ]
  `,
  )
})
