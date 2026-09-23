import * as Secp256k1 from 'ox/Secp256k1'
import * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import { serializeTransaction, type TransactionRequestEIP8141 } from 'viem'
import {
  fillTransaction,
  getBalance,
  getTransactionCount,
  sendRawTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts as constants } from '~test/constants.js'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient()

test('fills a frame transaction for signing', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })
  const nonce = await getTransactionCount(client, {
    address: accounts[0].address,
  })
  const request = {
    frames: [
      { flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' },
      { gas: 50_000n, mode: 'sender', to: accounts[1].address, value: 1n },
    ],
    signatures: [{ scheme: 'secp256k1' }],
    // TODO: remove once migrated to reth or anvil. Nethermind simulation requires an outer recipient.
    to: accounts[0].address,
  } satisfies TransactionRequestEIP8141
  // TODO: remove once migrated to reth or anvil.
  // Nethermind validates signatures when filling gas, before the transaction can be signed.
  await expect(
    fillTransaction(client, { ...request, account: accounts[0].address }),
  ).rejects.toThrow('frame transaction signature has the wrong length')
  const { transaction } = await fillTransaction(client, {
    ...request,
    account: accounts[0].address,
    gas: 100_000n,
  })
  expect(transaction.type).toBe('eip8141')
  if (transaction.type !== 'eip8141')
    throw new Error('Expected a frame transaction.')
  const {
    gasPrice: _gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    ...rest
  } = transaction
  expect(rest).toMatchInlineSnapshot(`
    {
      "blobVersionedHashes": [],
      "blockTimestamp": null,
      "chainId": 8141,
      "data": "0x",
      "frames": [
        {
          "data": "0x",
          "flags": 3,
          "gas": 50000n,
          "mode": 1,
          "stateGas": 0n,
          "value": 0n,
        },
        {
          "data": "0x",
          "flags": 0,
          "gas": 50000n,
          "mode": 2,
          "stateGas": 0n,
          "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "value": 1n,
        },
      ],
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "gas": 100000n,
      "hash": null,
      "input": "0x",
      "maxFeePerBlobGas": 0n,
      "nonce": 0,
      "signatures": [
        {
          "payload": "0x",
          "scheme": "secp256k1",
        },
      ],
      "to": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "type": "eip8141",
      "typeHex": "0x6",
      "value": 0n,
    }
  `)
  expect(maxFeePerGas).toBeGreaterThan(0n)
  expect(maxFeePerGas).toBeGreaterThanOrEqual(maxPriorityFeePerGas)
  expect(transaction.nonce).toBe(nonce)
  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance,
  )
  expect(
    await getTransactionCount(client, { address: accounts[0].address }),
  ).toBe(nonce)

  const envelope = {
    chainId: transaction.chainId,
    frames: transaction.frames,
    maxFeePerBlobGas: transaction.maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    sender: transaction.from,
    signatures: transaction.signatures,
  }
  const signature = Secp256k1.sign({
    payload: TxEnvelopeEip8141.getSignPayload({
      ...envelope,
      nonce: BigInt(nonce),
    }),
    privateKey: constants[0].privateKey,
  })
  const hash = await sendRawTransaction(client, {
    serializedTransaction: serializeTransaction({
      ...envelope,
      signatures: [{ scheme: 'secp256k1', signature }],
    }),
  })
  expect((await waitForTransactionReceipt(client, { hash })).status).toBe(
    'success',
  )
  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance + 1n,
  )
})
