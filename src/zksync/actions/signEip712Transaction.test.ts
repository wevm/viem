import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { anvilZksync } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { ZksyncTransactionRequestEIP712 } from '../../zksync/index.js'
import { signTransaction } from './signTransaction.js'

const sourceAccount = accounts[0]

const client = anvilZksync.getClient()

const base: ZksyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
}

test('default', async () => {
  expect(
    await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x71f8c880808080808000820144808082014494000000000000000000000000000000000000000082c350c0b841edc8fb1e839969b2072865653798be4b4e6ea7181ec97c5e32867bad5838224e1d247fb2f2f07c1bc70bf789d43404771ac496f4fc57c5e6398c1fa6fe6f62861cf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"`,
  )
})

test('errors: no eip712 domain fn', async () => {
  await expect(() =>
    signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: { ...client.chain, custom: {} },
      ...base,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [BaseError: \`getEip712Domain\` not found on chain.

    Version: viem@x.y.z]
  `,
  )
})

test('errors: no serializer fn', async () => {
  await expect(() =>
    signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: { ...client.chain, serializers: {} },
      ...base,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [BaseError: transaction serializer not found on chain.

    Version: viem@x.y.z]
  `,
  )
})

test('errors: no account', async () => {
  await expect(
    // @ts-expect-error
    () => signTransaction(client, base),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/docs/actions/wallet/signTransaction
    Version: viem@x.y.z]
  `,
  )
})
