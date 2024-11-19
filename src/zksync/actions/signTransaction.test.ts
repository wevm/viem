import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { anvilZksync } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { TransactionRequest } from '../../index.js'
import type { ZksyncTransactionRequestEIP712 } from '../../zksync/index.js'
import { signTransaction } from './signTransaction.js'

const sourceAccount = accounts[0]

const client = anvilZksync.getClient()

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
  const signature = await signTransaction(client, {
    account: privateKeyToAccount(sourceAccount.privateKey),
    ...eip712,
  })
  expect(signature.startsWith('0x71')).toBeTruthy()
})

test('other', async () => {
  const signature = await signTransaction(client, {
    account: privateKeyToAccount(sourceAccount.privateKey),
    ...base,
  })
  expect(signature.startsWith('0x02')).toBeTruthy()
})
