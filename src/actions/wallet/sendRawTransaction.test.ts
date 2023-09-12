import { expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { walletClient } from '~test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { prepareTransactionRequest } from './prepareTransactionRequest.js'
import { sendRawTransaction } from './sendRawTransaction.js'
import { signTransaction } from './signTransaction.js'

test('default', async () => {
  const request = await prepareTransactionRequest(walletClient, {
    account: privateKeyToAccount(accounts[0].privateKey),
    to: accounts[1].address,
    value: 1n,
  })
  const serializedTransaction = await signTransaction(walletClient, request)
  const hash = await sendRawTransaction(walletClient, { serializedTransaction })
  expect(hash).toBeDefined()
})
