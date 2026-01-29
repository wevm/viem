import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { signMessage } from './signMessage.js'

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({
  account: accounts[0].address,
})

test('default', async () => {
  expect(
    await signMessage(client!, {
      account: accounts[0].address,
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})

test('raw', async () => {
  expect(
    await signMessage(client!, {
      account: accounts[0].address,
      message: { raw: '0x68656c6c6f20776f726c64' },
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
  expect(
    await signMessage(client!, {
      account: accounts[0].address,
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

test('inferred account', async () => {
  expect(
    await signMessage(clientWithAccount!, {
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})

test('emoji', async () => {
  expect(
    await signMessage(client!, {
      account: accounts[0].address,
      message: '🥵',
    }),
  ).toMatchInlineSnapshot(
    `"0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b"`,
  )
})

test('local account', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  expect(
    await signMessage(client!, {
      account,
      message: 'hello world',
    }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )
})

test('error: no account', async () => {
  await expect(
    // @ts-expect-error
    signMessage(client!, {
      message: 'hello world',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/docs/actions/wallet/signMessage
    Version: viem@x.y.z]
  `,
  )
})
