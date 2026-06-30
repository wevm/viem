import { expect, test } from 'vitest'
import { Account, Actions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getWalletClient(anvil.mainnet)
const account = Account.fromPrivateKey(constants.accounts[0].privateKey)

test('local account', async () => {
  expect(
    await Actions.signMessage(client, {
      account,
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})

test('local account: raw hex', async () => {
  expect(
    await Actions.signMessage(client, {
      account,
      message: { raw: '0x68656c6c6f20776f726c64' },
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})

test('local account: raw bytes', async () => {
  expect(
    await Actions.signMessage(client, {
      account,
      message: {
        raw: Uint8Array.from([
          104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
        ]),
      },
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})

test('local account: emoji', async () => {
  expect(
    await Actions.signMessage(client, {
      account,
      message: '🥵',
    }),
  ).toMatchInlineSnapshot(
    `"0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b"`,
  )
})

test('json-rpc account', async () => {
  expect(
    await Actions.signMessage(client, {
      account: constants.accounts[0].address,
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})

test('inferred account', async () => {
  const client = anvil.getWalletClient(anvil.mainnet, {
    account: constants.accounts[0].address,
  })
  expect(
    await Actions.signMessage(client, {
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})

test('error: no account', async () => {
  await expect(Actions.signMessage(client, { message: 'hello world' })).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [Account.NotFoundError: Could not find an Account to execute with this Action.

    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@2.52.1]
  `)
})
