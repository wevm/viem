import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { sign } from './sign.js'

test('default', async () => {
  expect(
    await sign({
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
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
    await sign({
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    `
    {
      "r": "0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db08",
      "s": "0x31538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e098849",
      "v": 28n,
      "yParity": 1,
    }
  `,
  )
})
