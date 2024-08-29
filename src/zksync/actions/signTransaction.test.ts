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
    `"0x71f8c880808080808000820144808082014494000000000000000000000000000000000000000082c350c0b841bb509f381d29a038bd2f700bd6a1f1138edfd7a3cf7234c13a03b01a023a30aa53e6bd5e6a50fdcdcf74587c9395b8a314690abbc85aadab5ebcb7678994eacf1bf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"`,
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
