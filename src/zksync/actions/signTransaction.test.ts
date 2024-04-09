import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { zkSyncClient } from '~test/src/zksync.js'

import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { TransactionRequest } from '../../index.js'
import type { ZkSyncTransactionRequestEIP712 } from '../../zksync/index.js'
import { signTransaction } from './signTransaction.js'

const sourceAccount = accounts[0]

const base: TransactionRequest = {
  from: '0x0000000000000000000000000000000000000000',
  type: 'eip1559',
}
const eip712: ZkSyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
}

test('eip712', async () => {
  expect(
    await signTransaction(zkSyncClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...eip712,
    }),
  ).toMatchInlineSnapshot(
    `"0x71f8c680808080808000820144808082014494000000000000000000000000000000000000000080c0b8412e940527ab264b49c70e9c1bca7636ed2b87f94b5083140c2cbdcd570d99e2c149b697d0c6a037802d0a4757fbd5d1ffd980afccb270e9d182bf7c197bc4a2661bf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"`,
  )
})

test('other', async () => {
  expect(
    await signTransaction(zkSyncClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x02f84e82014480808080808080c080a0e9ff0193c0db842635d2b50dd8401c95f5fc53aa96b7170e85b5425c7ece8989a07bf8bd7e5a9ef6c8fb32cc7b5fc85f8529c71faab273eb7d00562542cc8b4dc4"`,
  )
})
