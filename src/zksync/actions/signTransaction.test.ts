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
  expect(
    await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...eip712,
    }),
  ).toMatchInlineSnapshot(
    `"0x71f8c880808080808000820144808082014494000000000000000000000000000000000000000082c350c0b841edc8fb1e839969b2072865653798be4b4e6ea7181ec97c5e32867bad5838224e1d247fb2f2f07c1bc70bf789d43404771ac496f4fc57c5e6398c1fa6fe6f62861cf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"`,
  )
})

test('other', async () => {
  expect(
    await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x02f84e82014480808080808080c080a0e9ff0193c0db842635d2b50dd8401c95f5fc53aa96b7170e85b5425c7ece8989a07bf8bd7e5a9ef6c8fb32cc7b5fc85f8529c71faab273eb7d00562542cc8b4dc4"`,
  )
})
