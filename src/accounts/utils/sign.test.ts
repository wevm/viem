import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { verifyHash } from '../../utils/signature/verifyHash.js'
import { sign } from './sign.js'

test('default', async () => {
  const signature_1 = await sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
    privateKey: accounts[0].privateKey,
  })
  expect(signature_1).toMatchInlineSnapshot(
    `
    {
      "r": "0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf1",
      "s": "0x5fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b",
      "v": 27n,
      "yParity": 0,
    }
  `,
  )
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      signature: signature_1,
    }),
  ).toBe(true)

  const signature_2 = await sign({
    hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
    privateKey: accounts[0].privateKey,
  })
  expect(signature_2).toMatchInlineSnapshot(
    `
    {
      "r": "0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db08",
      "s": "0x31538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e098849",
      "v": 28n,
      "yParity": 1,
    }
  `,
  )
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature: signature_2,
    }),
  ).toBe(true)
})

test('args: to (hex)', async () => {
  const signature_1 = await sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
    privateKey: accounts[0].privateKey,
    to: 'hex',
  })
  expect(signature_1).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      signature: signature_1,
    }),
  ).toBe(true)

  const signature_2 = await sign({
    hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
    privateKey: accounts[0].privateKey,
    to: 'hex',
  })
  expect(signature_2).toMatchInlineSnapshot(
    `"0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c"`,
  )
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature: signature_2,
    }),
  ).toBe(true)
})

test('args: to (bytes)', async () => {
  const signature_1 = await sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
    privateKey: accounts[0].privateKey,
    to: 'bytes',
  })
  expect(signature_1).toMatchInlineSnapshot(
    `
    Uint8Array [
      164,
      97,
      245,
      9,
      136,
      123,
      209,
      158,
      49,
      44,
      12,
      88,
      70,
      124,
      232,
      255,
      142,
      48,
      13,
      60,
      26,
      144,
      182,
      8,
      167,
      96,
      197,
      184,
      3,
      24,
      234,
      241,
      95,
      229,
      124,
      150,
      249,
      23,
      93,
      108,
      212,
      218,
      173,
      70,
      99,
      118,
      59,
      170,
      126,
      120,
      131,
      110,
      6,
      125,
      1,
      99,
      233,
      162,
      204,
      242,
      255,
      117,
      63,
      91,
      27,
    ]
  `,
  )
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      signature: signature_1,
    }),
  ).toBe(true)

  const signature_2 = await sign({
    hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
    privateKey: accounts[0].privateKey,
    to: 'bytes',
  })
  expect(signature_2).toMatchInlineSnapshot(
    `
    Uint8Array [
      196,
      216,
      188,
      218,
      118,
      45,
      53,
      234,
      121,
      217,
      84,
      43,
      35,
      32,
      15,
      70,
      194,
      193,
      137,
      157,
      177,
      91,
      249,
      41,
      187,
      172,
      175,
      96,
      149,
      129,
      219,
      8,
      49,
      83,
      131,
      116,
      160,
      18,
      6,
      81,
      126,
      221,
      147,
      78,
      71,
      66,
      18,
      160,
      241,
      226,
      214,
      46,
      154,
      1,
      205,
      100,
      241,
      207,
      148,
      234,
      46,
      9,
      136,
      73,
      28,
    ]
  `,
  )
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature: signature_2,
    }),
  ).toBe(true)
})
