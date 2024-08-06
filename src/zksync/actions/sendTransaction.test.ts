import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { anvilZksync } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { EIP1193RequestFn, TransactionRequest } from '../../index.js'
import type { ZksyncTransactionRequestEIP712 } from '../index.js'
import { sendTransaction } from './sendTransaction.js'

const sourceAccount = accounts[0]

const client = anvilZksync.getClient()

client.request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  return anvilZksync.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

const base: TransactionRequest = {
  from: '0x0000000000000000000000000000000000000000',
  type: 'eip1559',
}
const eip712: ZksyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
}

test('eip712', async () => {
  expect(
    await sendTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...eip712,
    }),
  ).toMatchInlineSnapshot(
    `"0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87"`,
  )
})

test('other', async () => {
  expect(
    await sendTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87"`,
  )
})
