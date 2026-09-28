import { Secp256k1 } from 'ox'
import { SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { createClient } from 'viem'
import {
  fillTransaction,
  prepareTransactionRequest,
  sendRawTransactionSync,
} from 'viem/actions'
import { Actions, Relay, Transaction, withRelay } from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

const caller = Tempo.getClient({ chain: Tempo.chain })

beforeAll(async () => {
  await Promise.all(
    [0, 9].map((index) =>
      Actions.faucet.fundSync(Tempo.getClient({ chain: Tempo.chain }), {
        account: Tempo.accounts[index]!,
        timeout: 60_000,
      }),
    ),
  )
})

test.each([true, false])('sponsorship accepted: %s', async (accepted) => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.feePayer({
          account: feePayerAccount,
          validate: () => accepted,
        }),
      ],
    }),
  })
  const { transaction, capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
    feeToken: Tempo.addresses.alphaUsd,
  })
  expect(capabilities?.sponsored).toBe(accepted)
  expect(Boolean(transaction.feePayerSignature)).toBe(accepted)
  const signed = await (async () => {
    if (accepted) return userAccount.signTransaction(transaction as never)
    const envelope = TxEnvelopeTempo.deserialize(
      (await Transaction.serialize(transaction as never)) as `0x76${string}`,
    )
    const signature = await userAccount.sign({
      hash: TxEnvelopeTempo.getSignPayload(envelope),
    })
    return TxEnvelopeTempo.serialize(envelope, {
      signature: SignatureEnvelope.from(signature),
    })
  })()
  const receipt = await sendRawTransactionSync(client, {
    serializedTransaction: signed,
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(
    (accepted ? feePayerAccount : userAccount).address.toLowerCase(),
  )
})

test('raw sponsorship resolves chain from the signed envelope', async () => {
  const request = await prepareTransactionRequest(
    Tempo.getClient({ chain: Tempo.chain }),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    getClient: ({ chainId }) =>
      Tempo.getClient({
        chain: { ...Tempo.chain, id: chainId },
        batch: { multicall: { deployless: true } },
      }),
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })
  const result = (await relay.request({
    method: 'eth_signRawTransaction',
    params: [signed],
  })) as `0x${string}`
  const envelope = TxEnvelopeTempo.deserialize(result as `0x76${string}`)
  expect(
    Secp256k1.recoverAddress({
      payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
        sender: userAccount.address,
      }),
      signature: envelope.feePayerSignature!,
    }),
  ).toBe(feePayerAccount.address.toLowerCase())
  await expect(
    relay.request(
      { method: 'eth_signRawTransaction', params: [signed] },
      { chainId: 1 },
    ),
  ).rejects.toThrow('Conflicting chain ids.')
})

test('rejects a mismatched resolver before signing a prepared fill', async () => {
  const relay = Relay.create({
    getClient: () => Tempo.getClient({ chain: Tempo.chain }),
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })
  await expect(
    relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          from: userAccount.address,
          chainId: 1,
          gas: '0x100000',
          nonce: '0x0',
          maxFeePerGas: '0x1',
          calls: [
            Actions.token.transfer.call(caller, {
              token: Tempo.addresses.alphaUsd,
              to: recipient.address,
              amount: 1n,
            }),
          ],
        },
      ],
    }),
  ).rejects.toThrow('Conflicting chain ids.')
})

test.each([
  'billing_past_due',
  'billing_required',
  'fee_token_unsupported',
  'spend_limit_exceeded',
  'tx_fee_limit_exceeded',
] as const)('raw sponsorship returns the %s refusal code', async (verdict) => {
  const request = await prepareTransactionRequest(
    Tempo.getClient({ chain: Tempo.chain }),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    client: Tempo.getClient({ chain: Tempo.chain }),
    plugins: [
      Relay.feePayer({ account: feePayerAccount, validate: () => verdict }),
    ],
  })
  await expect(
    relay.request({ method: 'eth_signRawTransaction', params: [signed] }),
  ).rejects.toMatchObject({
    code: -32602,
    data: { code: verdict },
  })
})

test('a failed sponsorship record prevents broadcast', async () => {
  const request = await prepareTransactionRequest(
    Tempo.getClient({ chain: Tempo.chain }),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    client: Tempo.getClient({ chain: Tempo.chain }),
    plugins: [
      Relay.feePayer({
        account: feePayerAccount,
        onSponsored: () => {
          throw new Error('Recording failed')
        },
      }),
    ],
  })
  const before = await Actions.token.getBalance(caller, {
    account: recipient.address,
    token: Tempo.addresses.alphaUsd,
  })
  await expect(
    relay.request({ method: 'eth_sendRawTransactionSync', params: [signed] }),
  ).rejects.toMatchObject({ code: -32603 })
  expect(
    await Actions.token.getBalance(caller, {
      account: recipient.address,
      token: Tempo.addresses.alphaUsd,
    }),
  ).toEqual(before)
})
