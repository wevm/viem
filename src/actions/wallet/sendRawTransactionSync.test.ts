import { expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { ErrorsExample } from '../../../contracts/generated.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { deployErrorExample } from '../../../test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { encodeFunctionData } from '../../utils/index.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../index.js'
import { prepareTransactionRequest } from './prepareTransactionRequest.js'
import { sendRawTransactionSync } from './sendRawTransactionSync.js'
import { signTransaction } from './signTransaction.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const request = await prepareTransactionRequest(client, {
    account: privateKeyToAccount(accounts[0].privateKey),
    to: accounts[1].address,
    value: 1n,
  })
  const serializedTransaction = await signTransaction(client, request)
  const [receipt] = await Promise.all([
    sendRawTransactionSync(client, {
      serializedTransaction,
    }),
    (async () => {
      await wait(100)
      await mine(client, { blocks: 1 })
    })(),
  ])
  expect(receipt).toBeDefined()
})

test('args: throwOnReceiptRevert', async () => {
  const { contractAddress } = await deployErrorExample()

  const request = await prepareTransactionRequest(client, {
    account: privateKeyToAccount(accounts[0].privateKey),
    data: encodeFunctionData({
      abi: ErrorsExample.abi,
      functionName: 'revertWrite',
    }),
    gas: 100_000n,
    throwOnReceiptRevert: true,
    to: contractAddress!,
  })
  const serializedTransaction = await signTransaction(client, request)
  await expect(() =>
    Promise.all([
      sendRawTransactionSync(client, {
        serializedTransaction,
      }),
      (async () => {
        await wait(100)
        await mine(client, { blocks: 1 })
      })(),
    ]),
  ).rejects.toThrow('The receipt marked the transaction as "reverted"')
})
