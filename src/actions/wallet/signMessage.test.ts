import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { verifyMessage } from '../public/verifyMessage.js'
import { signMessage } from './signMessage.js'

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({
  account: accounts[0].address,
})

test('default', async () => {
  const signature = await signMessage(client!, {
    account: accounts[0].address,
    message: 'hello world',
  })
  expect(
    await verifyMessage(client!, {
      address: accounts[0].address,
      message: 'hello world',
      signature,
    }),
  ).toBe(true)
})

test('raw', async () => {
  {
    const signature = await signMessage(client!, {
      account: accounts[0].address,
      message: { raw: '0x68656c6c6f20776f726c64' },
    })
    expect(
      await verifyMessage(client!, {
        address: accounts[0].address,
        message: 'hello world',
        signature,
      }),
    ).toBe(true)
  }

  {
    const signature = await signMessage(client!, {
      account: accounts[0].address,
      message: {
        raw: Uint8Array.from([
          104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
        ]),
      },
    })
    expect(
      await verifyMessage(client!, {
        address: accounts[0].address,
        message: {
          raw: Uint8Array.from([
            104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
          ]),
        },
        signature,
      }),
    ).toBe(true)
  }
})

test('inferred account', async () => {
  const signature = await signMessage(clientWithAccount!, {
    message: 'hello world',
  })
  expect(
    await verifyMessage(clientWithAccount!, {
      address: clientWithAccount.account.address,
      message: 'hello world',
      signature,
    }),
  ).toBe(true)
})

test('local account', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  const signature = await signMessage(client!, {
    account,
    message: 'hello world',
  })
  expect(
    await verifyMessage(client!, {
      address: account.address,
      message: 'hello world',
      signature,
    }),
  ).toBe(true)
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
