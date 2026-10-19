import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  chain,
  feeToken,
  getClient,
  nodeEnv,
  setupFeeToken,
  setupToken,
} from '~test/tempo/config.js'
import {
  getTransaction,
  sendTransactionSync,
  waitForTransactionReceipt,
} from '../../actions/index.js'
import { maxUint256 } from '../../constants/number.js'
import {
  type Address,
  custom,
  type Hash,
  type Hex,
  parseUnits,
} from '../../index.js'
import * as actions from '../actions/index.js'
import type { Transaction } from '../Transaction.js'
import { getExpiringNonceHash, transactionReplacement } from './replacement.js'

const sender = accounts.at(0)!
const sponsor = accounts.at(1)!

const client = getClient({
  account: sender,
  chain: chain.extend({ feeToken }),
})

beforeAll(async () => {
  await setupFeeToken(client, { account: sponsor })
})

const getKey = (transaction: Record<string, unknown>) =>
  transactionReplacement.getKey(transaction as never)

const getReason = (
  replaced: Record<string, unknown>,
  replacement: Record<string, unknown>,
) =>
  transactionReplacement.getReason({
    replaced: replaced as never,
    replacement: replacement as never,
  })

describe('getKey', () => {
  test('protocol nonces share a slot across transaction types', () => {
    const ethereum = getKey({ nonce: 3, type: 'eip1559' })
    expect(getKey({ nonce: 3, type: 'tempo' })).toBe(ethereum)
    expect(getKey({ nonce: 3, nonceKey: 0n, type: 'tempo' })).toBe(ethereum)
    expect(getKey({ nonce: 4, type: 'eip1559' })).not.toBe(ethereum)
  })

  test('2D nonces occupy their own key', () => {
    const key = getKey({ nonce: 0, nonceKey: 5n, type: 'tempo' })
    expect(key).not.toBe(getKey({ nonce: 0, type: 'tempo' }))
    expect(key).not.toBe(getKey({ nonce: 0, nonceKey: 6n, type: 'tempo' }))
    expect(key).toBe(getKey({ nonce: 0, nonceKey: 5n, type: 'tempo' }))
  })

  test('expiring nonces are keyed by sender payload, not sponsorship', async () => {
    const { transactionHash } = await sendTransactionSync(client, {
      feePayer: sponsor,
      nonceKey: 'expiring',
      to: '0x0000000000000000000000000000000000000000',
    })
    const transaction = (await getTransaction(client, {
      hash: transactionHash,
    })) as Transaction
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
        feeToken: '0x20c0000000000000000000000000000000000001',
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
  const tempo = (calls: readonly Record<string, unknown>[]) => ({
    calls,
    from,
    type: 'tempo',
  })

  test('repriced: same calls', () => {
    expect(
      getReason(
        tempo([{ data: '0x1234', to }]),
        tempo([{ data: '0x1234', to: to.toUpperCase().replace('0X', '0x') }]),
      ),
    ).toBe('repriced')
    expect(
      getReason(tempo([{ to }]), {
        from,
        input: '0x',
        to,
        type: 'eip1559',
        value: 0n,
      }),
    ).toBe('repriced')
  })

  test('cancelled: empty calls to the sender', () => {
    expect(getReason(tempo([{ to }]), tempo([{ to: from }]))).toBe('cancelled')
  })

  test('replaced: different calls', () => {
    expect(getReason(tempo([{ to }]), tempo([{ data: '0x1234', to }]))).toBe(
      'replaced',
    )
    expect(getReason(tempo([{ to }]), tempo([{ to }, { to }]))).toBe('replaced')
    expect(
      getReason(tempo([{ to }]), tempo([{ data: '0x12', to: from }])),
    ).toBe('replaced')
  })
})

describe.runIf(nodeEnv === 'localnet')('node', () => {
  test('expiring nonce hash matches the hash the node records', async (ctx) => {
    if (!(await supportsChannelReserve())) ctx.skip()

    const { token } = await setupToken(client, {
      name: 'Replacement Test',
      symbol: 'RPL',
    })

    for (const parameters of [
      { nonceKey: 'expiring' },
      { feePayer: sponsor, nonceKey: 'expiring' },
      {},
    ] as const) {
      const { expiringNonceHash, receipt } = await actions.channel.openSync(
        client,
        {
          ...parameters,
          deposit: parseUnits('1', 6),
          payee: sponsor.address,
          token,
        },
      )
      const transaction = (await getTransaction(client, {
        hash: receipt.transactionHash,
      })) as Transaction
      expect(getExpiringNonceHash(transaction)).toBe(expiringNonceHash)
    }
  })

  test('waits for the awaited expiring-nonce transaction when a sibling shares its block', async () => {
    const [first, second] = await sendSiblings()

    const { receipt, replacements } = await waitLagging(second.transactionHash)

    expect(receipt.transactionHash).toBe(second.transactionHash)
    expect(replacements).toEqual([])
    expect(first.blockNumber).toBe(second.blockNumber)
  })

  test('does not treat a pending expiring-nonce transaction as replaced by a sibling', async () => {
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

/** Sends two expiring-nonce transactions from one sender into one block. */
async function sendSiblings() {
  const send = (to: Address) =>
    sendTransactionSync(client, { nonceKey: 'expiring', to })
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
  hash: Hash,
  options: { pendingIn?: bigint | undefined } = {},
) {
  let lagging = 3
  const isLagging = () => lagging > 0
  const laggingClient = getClient({
    transport: custom({
      async request(args) {
        const params = args.params as readonly unknown[] | undefined
        if (args.method === 'eth_getTransactionReceipt' && params?.[0] === hash)
          if (lagging-- > 0) return null
        if (options.pendingIn !== undefined && isLagging()) {
          if (args.method === 'eth_getBlockByNumber')
            return client.request({
              ...args,
              params: [
                `0x${options.pendingIn.toString(16)}`,
                ...params!.slice(1),
              ],
            } as never)
          if (
            args.method === 'eth_getTransactionByHash' &&
            params?.[0] === hash
          ) {
            const transaction = (await client.request(args as never)) as Record<
              string,
              Hex | null
            >
            return {
              ...transaction,
              blockHash: null,
              blockNumber: null,
              transactionIndex: null,
            }
          }
        }
        return client.request(args as never)
      },
    }),
  })
  const replacements: unknown[] = []
  const receipt = await waitForTransactionReceipt(laggingClient, {
    hash,
    onReplaced: (replacement) => replacements.push(replacement),
  })
  return { receipt, replacements }
}

async function supportsChannelReserve() {
  const schedule = (await client.request({
    method: 'tempo_forkSchedule',
  } as never)) as {
    schedule: readonly { active: boolean; name: string }[]
  }
  return schedule.schedule.some((fork) => {
    if (!fork.active) return false
    const match = fork.name.match(/^T(\d+)$/)
    return match ? Number(match[1]) >= 5 : false
  })
}
