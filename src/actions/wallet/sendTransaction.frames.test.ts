import { nonceManager as sharedNonceManager } from 'viem'
import { privateKeyToAccount, toAccount } from 'viem/accounts'
import {
  getBalance,
  getTransactionCount,
  prepareTransactionRequest,
  sendRawTransaction,
  sendTransaction,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts as constants } from '~test/constants.js'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0] })
const request = {
  frames: [
    { flags: 'approveExecutionAndPayment', mode: 'verify' },
    { mode: 'sender', to: accounts[1].address, value: 1n },
  ],
  signatures: [{ scheme: 'secp256k1' }],
} as const

test('default', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })
  const hash = await sendTransaction(client, request)
  const receipt = await waitForTransactionReceipt(client, { hash })

  expect(receipt.status).toBe('success')
  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance + 1n,
  )
})

test('prepare, sign, and send', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })
  const prepared = await prepareTransactionRequest(client, request)
  const serializedTransaction = await signTransaction(client, prepared)
  const hash = await sendRawTransaction(client, { serializedTransaction })

  expect((await waitForTransactionReceipt(client, { hash })).status).toBe(
    'success',
  )
  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance + 1n,
  )
})

test('nonce manager resets after preparation failure', async () => {
  const account = privateKeyToAccount(constants[0].privateKey, {
    nonceManager: sharedNonceManager,
  })
  const nonce = await getTransactionCount(client, { address: account.address })

  await expect(
    sendTransaction(client, { ...request, account, frames: [{ mode: 255 }] }),
  ).rejects.toThrow()
  expect(await getTransactionCount(client, { address: account.address })).toBe(
    nonce,
  )

  const hash = await sendTransaction(client, { ...request, account })
  expect((await waitForTransactionReceipt(client, { hash })).status).toBe(
    'success',
  )
  expect(await getTransactionCount(client, { address: account.address })).toBe(
    nonce + 1,
  )
})

test('does not broadcast when signing is rejected', async () => {
  const account = toAccount({
    address: accounts[0].address,
    signMessage: accounts[0].signMessage,
    async signTransaction() {
      throw new Error('Signing rejected.')
    },
    signTypedData: accounts[0].signTypedData,
  })
  const nonce = await getTransactionCount(client, { address: account.address })

  await expect(
    sendTransaction(client, { ...request, account }),
  ).rejects.toThrow('Signing rejected.')
  expect(await getTransactionCount(client, { address: account.address })).toBe(
    nonce,
  )
})
