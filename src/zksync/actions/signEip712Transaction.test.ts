import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { zkSyncClient } from '~test/src/zksync.js'

import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { ZkSyncTransactionRequestEIP712 } from '../../zksync/index.js'
import { signTransaction } from './signTransaction.js'

const sourceAccount = accounts[0]

const base: ZkSyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
}

test('default', async () => {
  expect(
    await signTransaction(zkSyncClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x71f8c680808080808000820144808082014494000000000000000000000000000000000000000080c0b8412e940527ab264b49c70e9c1bca7636ed2b87f94b5083140c2cbdcd570d99e2c149b697d0c6a037802d0a4757fbd5d1ffd980afccb270e9d182bf7c197bc4a2661bf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"`,
  )
})

test('errors: no eip712 domain fn', async () => {
  await expect(() =>
    signTransaction(zkSyncClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: { ...zkSyncClient.chain, custom: {} },
      ...base,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [ViemError: \`getEip712Domain\` not found on chain.

    Version: viem@1.0.2]
  `,
  )
})

test('errors: no serializer fn', async () => {
  await expect(() =>
    signTransaction(zkSyncClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: { ...zkSyncClient.chain, serializers: {} },
      ...base,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [ViemError: transaction serializer not found on chain.

    Version: viem@1.0.2]
  `,
  )
})

test('errors: no account', async () => {
  await expect(
    // @ts-expect-error
    () => signTransaction(zkSyncClient, base),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

    Docs: https://viem.sh/docs/actions/wallet/signTransaction#account
    Version: viem@1.0.2]
  `,
  )
})
