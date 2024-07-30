import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { anvilZkSync } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { EIP1193RequestFn } from '../../index.js'
import type { ZkSyncTransactionRequestEIP712 } from '../../zksync/index.js'
import { sendEip712Transaction } from './sendEip712Transaction.js'

const sourceAccount = accounts[0]

const client = anvilZkSync.getClient()

client.request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  return anvilZkSync.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

const base: ZkSyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
}

test('default', async () => {
  expect(
    await sendEip712Transaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87"`,
  )
})

test('errors: no account', async () => {
  await expect(() =>
    // @ts-expect-error
    sendEip712Transaction(client, base),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/docs/actions/wallet/sendTransaction#account
    Version: viem@x.y.z]
  `)
})

test('errors: invalid eip712 tx', async () => {
  await expect(() =>
    sendEip712Transaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: Transaction is not an EIP712 transaction.

    Transaction must:
      - include \`type: "eip712"\`
      - include one of the following: \`customSignature\`, \`paymaster\`, \`paymasterInput\`, \`gasPerPubdata\`, \`factoryDeps\`

    Request Arguments:
      chain:  zkSync Era (Local) (id: 324)
      from:   0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

    Version: viem@x.y.z]
  `)
})
