import { expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { hashAuthorization } from './hashAuthorization.js'

test('default', () => {
  expect(
    hashAuthorization({
      address: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
      chainId: 1,
      nonce: 40,
    }),
  ).toMatchInlineSnapshot(
    `"0xf4b2818a2452d296afd2a3434f490930548bf91f29196463ab563a9998e698e1"`,
  )

  expect(
    hashAuthorization({
      chainId: 69,
      address: wagmiContractConfig.address,
      nonce: 420,
    }),
  ).toMatchInlineSnapshot(
    `"0x62d076dc1afee955cc80d50d192d8d60ea68b5b3b871de7dda3eba3f1544b3c3"`,
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
      190,
      250,
      208,
      44,
      87,
      218,
      191,
      180,
      93,
      163,
      101,
      147,
      149,
      12,
      102,
      164,
      115,
      81,
      67,
      100,
      239,
      142,
      22,
      81,
      0,
      165,
      98,
      117,
      147,
      192,
      153,
      209,
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
      98,
      208,
      118,
      220,
      26,
      254,
      233,
      85,
      204,
      128,
      213,
      13,
      25,
      45,
      141,
      96,
      234,
      104,
      181,
      179,
      184,
      113,
      222,
      125,
      218,
      62,
      186,
      63,
      21,
      68,
      179,
      195,
    ]
  `,
  )
})
