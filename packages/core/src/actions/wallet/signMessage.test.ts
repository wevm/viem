import { expect, test } from 'vitest'

import { accounts, walletClient } from '../../../test'
import { encodeBytes, encodeHex } from '../../utils'

import { signMessage } from './signMessage'

test('hex', async () => {
  expect(
    await signMessage(walletClient!, {
      from: accounts[0].address,
      data: '0xdeadbeaf',
    }),
  ).toMatchInlineSnapshot(
    '"0x791703250f789557b30c2ed9066cdc9bfcfba4504583d417b61f07891c4c9ace5fa84cb97062712e6e614c29ad59c610e310123efdb40bd7a9c516ace2084cd01c"',
  )

  expect(
    await signMessage(walletClient!, {
      from: accounts[0].address,
      data: encodeHex('hello world'),
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )

  await expect(
    signMessage(walletClient!, {
      from: accounts[0].address,
      // @ts-expect-error - testing
      data: 'deadbeaf',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    "data (\\"deadbeaf\\") must be a hex value. Encode it first to a hex with the \`encodeHex\` util.

    Docs: https://viem.sh/TODO

    Version: viem@1.0.2"
  `,
  )
})

test('bytes', async () => {
  expect(
    await signMessage(walletClient!, {
      from: accounts[0].address,
      data: new Uint8Array([1, 123, 14, 51, 12, 55, 11, 22, 45, 22, 56]),
    }),
  ).toMatchInlineSnapshot(
    '"0x473fb0b83966f3e886af3a5a1403b2db186c432952d26eaab00819674c47a1e003d439eb257fec0d49738976e8ed30cd61bac475edb7e1c93eb08f68f24481d61b"',
  )

  expect(
    await signMessage(walletClient!, {
      from: accounts[0].address,
      data: encodeBytes('hello world'),
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )
})
