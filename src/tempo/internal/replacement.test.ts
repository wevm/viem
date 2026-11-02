import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { beforeAll, describe, expect, test } from 'vitest'

import { Actions, custom } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, Actions as TempoActions } from 'viem/tempo'

import type { Transaction } from '../chainConfig.js'
import { getExpiringNonceHash, transactionReplacement } from './replacement.js'

const maxUint256 = 2n ** 256n - 1n
const sender = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const sponsor = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account: sender, feeToken: tempo.pathUsd })

beforeAll(async () => {
  await tempo.setupFeeToken(client, { account: sponsor })
})

// Partial transactions exercise only the fields each hook reads.
const getKey = (transaction: Record<string, unknown>) =>
  transactionReplacement.getKey(transaction as unknown as Transaction)

const getReason = (
  replaced: Record<string, unknown>,
  replacement: Record<string, unknown>,
) =>
  transactionReplacement.getReason({
    replaced: replaced as unknown as Transaction,
    replacement: replacement as unknown as Transaction,
  })

/** Sends an expiring nonce transaction and returns it as the node records it. */
async function sendExpiring(
  options: { feePayer?: Account.Account | undefined } = {},
) {
  const { transactionHash } = await Actions.transaction.sendSync(client, {
    ...options,
    nonceKey: 'expiring',
    to: '0x0000000000000000000000000000000000000000',
  })
  const transaction = await Actions.transaction.get(client, {
    hash: transactionHash,
  })
  if (transaction.type !== 'tempo') throw new Error('expected tempo')
  return transaction
}

describe('getKey', () => {
  test('protocol nonces share a slot across transaction types', () => {
    const ethereum = getKey({ nonce: 3n, type: 'eip1559' })
    expect(ethereum).toMatchInlineSnapshot(`"0:3"`)
    expect(getKey({ nonce: 3n, type: 'tempo' })).toBe(ethereum)
    expect(getKey({ nonce: 3n, nonceKey: 0n, type: 'tempo' })).toBe(ethereum)
    expect(getKey({ nonce: 4n, type: 'eip1559' })).not.toBe(ethereum)
  })

  test('2D nonces occupy their own key', () => {
    const key = getKey({ nonce: 0n, nonceKey: 5n, type: 'tempo' })
    expect(key).toMatchInlineSnapshot(`"5:0"`)
    expect(key).not.toBe(getKey({ nonce: 0n, type: 'tempo' }))
    expect(key).not.toBe(getKey({ nonce: 0n, nonceKey: 6n, type: 'tempo' }))
  })

  test('expiring nonces are keyed by sender payload, not sponsorship', async () => {
    const transaction = await sendExpiring({ feePayer: sponsor })
    expect(transaction.nonceKey).toBe(maxUint256)
    expect(transaction.feePayerSignature).toBeDefined()

    const key = getKey(transaction)
    expect(key).toBe(`expiring:${getExpiringNonceHash(transaction)}`)

    // Re-sponsored with another fee payer signature and fee token.
    expect(
      getKey({
        ...transaction,
        feePayerSignature: {
          ...transaction.feePayerSignature!,
          r: `0x${'1'.repeat(64)}`,
        },
        feeToken: tempo.alphaUsd,
        hash: `0x${'f'.repeat(64)}`,
      }),
    ).toBe(key)

    // A different sender payload is a different transaction.
    expect(
      getKey({
        ...transaction,
        calls: [{ to: '0x0000000000000000000000000000000000000001' }],
      }),
    ).not.toBe(key)
    expect(getKey({ ...transaction, feePayerSignature: undefined })).not.toBe(
      key,
    )
    expect(getKey({ ...transaction, from: sponsor.address })).not.toBe(key)
  })
})

describe('getReason', () => {
  const from = sender.address
  const to = '0x0000000000000000000000000000000000000001'
  const calls = (calls: readonly Record<string, unknown>[]) => ({
    calls,
    from,
    type: 'tempo',
  })

  test('repriced: same calls', () => {
    expect(
      getReason(
        calls([{ data: '0x1234', to }]),
        calls([{ data: '0x1234', to: to.toUpperCase().replace('0X', '0x') }]),
      ),
    ).toBe('repriced')
    expect(
      getReason(calls([{ to }]), {
        from,
        input: '0x',
        to,
        type: 'eip1559',
        value: 0n,
      }),
    ).toBe('repriced')
  })

  test('cancelled: empty calls to the sender', () => {
    expect(getReason(calls([{ to }]), calls([{ to: from }]))).toBe('cancelled')
  })

  test('replaced: different calls', () => {
    expect(getReason(calls([{ to }]), calls([{ data: '0x1234', to }]))).toBe(
      'replaced',
    )
    expect(getReason(calls([{ to }]), calls([{ to }, { to }]))).toBe('replaced')
    expect(
      getReason(calls([{ to }]), calls([{ data: '0x12', to: from }])),
    ).toBe('replaced')
  })
})

describe('node', () => {
  test('expiring nonce hash matches the hash the node records', async () => {
    const { token } = await tempo.setupToken(client, {
      name: 'Replacement Test',
      symbol: 'RPL',
    })

    for (const options of [
      { nonceKey: 'expiring' },
      { feePayer: sponsor, nonceKey: 'expiring' },
      {},
    ] as const) {
      const { expiringNonceHash, receipt } =
        await TempoActions.channel.openSync(client, {
          ...options,
          deposit: Value.from('1', 6),
          payee: sponsor.address,
          token,
        })
      const transaction = await Actions.transaction.get(client, {
        hash: receipt.transactionHash,
      })
      if (transaction.type !== 'tempo') throw new Error('expected tempo')
      expect(getExpiringNonceHash(transaction)).toBe(expiringNonceHash)
    }
  })

  test('waits for the awaited expiring nonce transaction when a sibling shares its block', async () => {
    const [first, second] = await sendSiblings()

    const { receipt, replacements } = await waitLagging(second.transactionHash)

    expect(receipt.transactionHash).toBe(second.transactionHash)
    expect(replacements).toEqual([])
    expect(first.blockNumber).toBe(second.blockNumber)
  })

  test('does not treat a pending expiring nonce transaction as replaced by a sibling', async () => {
    const [, second] = await sendSiblings()

    // The RPC still reports the awaited transaction as pending, and its
    // replacement search lands on the block that mined the sibling.
    const { receipt, replacements } = await waitLagging(
      second.transactionHash,
      { pendingIn: second.blockNumber },
    )

    expect(receipt.transactionHash).toBe(second.transactionHash)
    expect(replacements).toEqual([])
  })
})

/** Sends two expiring nonce transactions from one sender into one block. */
async function sendSiblings() {
  const send = (to: `0x${string}`) =>
    Actions.transaction.sendSync(client, { nonceKey: 'expiring', to })
  const sendPair = () =>
    Promise.all([
      send('0x0000000000000000000000000000000000000000'),
      send('0x0000000000000000000000000000000000000001'),
    ])
  let pair = await sendPair()
  for (
    let attempt = 1;
    attempt < 5 && pair[0].blockNumber !== pair[1].blockNumber;
    attempt++
  )
    pair = await sendPair()
  expect(pair[1].blockNumber).toBe(pair[0].blockNumber)
  return pair
}

/**
 * Waits for `hash` through an RPC whose receipt index lags, which sends the
 * wait into replacement detection.
 */
async function waitLagging(
  hash: `0x${string}`,
  options: { pendingIn?: bigint | undefined } = {},
) {
  let lagging = 3
  const laggingClient = Client.create({
    chain: tempoLocalnet,
    pollingInterval: 100,
    transport: custom({
      async request(request) {
        const params = request.params as readonly unknown[] | undefined
        if (
          request.method === 'eth_getTransactionReceipt' &&
          params?.[0] === hash &&
          lagging-- > 0
        )
          return null
        if (typeof options.pendingIn !== 'undefined' && lagging > 0) {
          if (request.method === 'eth_getBlockByNumber')
            return client.request({
              method: 'eth_getBlockByNumber',
              params: [`0x${options.pendingIn.toString(16)}`, true],
            })
          if (
            request.method === 'eth_getTransactionByHash' &&
            params?.[0] === hash
          ) {
            const transaction = await client.request({
              method: 'eth_getTransactionByHash',
              params: [hash],
            })
            return {
              ...transaction,
              blockHash: null,
              blockNumber: null,
              transactionIndex: null,
            }
          }
        }
        return client.request(request as Parameters<typeof client.request>[0])
      },
    }),
  })
  const replacements: unknown[] = []
  const watcher = Actions.transaction.waitForReceipt(laggingClient, { hash })
  watcher.onReplaced((replacement) => replacements.push(replacement))
  const receipt = await watcher.receipt
  return { receipt, replacements }
}
