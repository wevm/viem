import { fc, test } from '@fast-check/vitest'
import { beforeAll, describe, expect } from 'vitest'
import { accounts, getClient, http } from '~test/tempo/config.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import { waitForBlock } from '~test/tempo/prool.js'
import {
  getTransaction,
  sendTransactionSync,
  signTransaction,
} from '../actions/index.js'
import { custom } from '../clients/transports/custom.js'
import { maxUint256 } from '../constants/number.js'
import * as Actions from './actions/index.js'
import * as Transaction from './Transaction.js'
import { withRelay } from './Transport.js'

const nodeParameters = () =>
  fuzzParameters(5, { runsVariable: 'TEMPO_FUZZ_NODE_RUNS' })

const nonceBurst = fc.integer({ min: 2, max: 6 })
const nonceKey = fc.bigInt({ min: 1n, max: 2n ** 128n })
const nonceScenario = fc.oneof(
  fc.record({ burst: nonceBurst, mode: fc.constant('automatic' as const) }),
  fc.record({ burst: nonceBurst, mode: fc.constant('expiring' as const) }),
  fc.record({
    burst: nonceBurst,
    mode: fc.constant('independent' as const),
    nonceKey,
  }),
  fc.record({
    burst: nonceBurst,
    mode: fc.constant('sequential' as const),
    nonceKey,
  }),
)
const sponsorshipScenario = {
  accountIndex: fc.integer({ min: 1, max: 10 }),
  burst: fc.integer({ min: 2, max: 5 }),
  policy: fc.constantFrom('sign-only' as const, 'sign-and-broadcast' as const),
}

beforeAll(() => waitForBlock(getClient()))

describe('Tempo nonce concurrency: node fuzz', () => {
  test.prop(
    { scenario: nonceScenario },
    {
      ...nodeParameters(),
      examples: [
        { scenario: { burst: 2, mode: 'automatic' } },
        { scenario: { burst: 6, mode: 'automatic' } },
        { scenario: { burst: 2, mode: 'expiring' } },
        { scenario: { burst: 6, mode: 'expiring' } },
        { scenario: { burst: 2, mode: 'independent', nonceKey: 1n } },
        {
          scenario: {
            burst: 6,
            mode: 'independent',
            nonceKey: 2n ** 128n,
          },
        },
        { scenario: { burst: 2, mode: 'sequential', nonceKey: 1n } },
        {
          scenario: {
            burst: 6,
            mode: 'sequential',
            nonceKey: 2n ** 128n,
          },
        },
      ],
    },
  )('executes generated expiring and 2D nonce bursts', async ({ scenario }) => {
    const account = accounts[0]
    const client = getClient({ account })
    const batchAddress = nextAddressBatch()

    const parameters = await Promise.all(
      Array.from({ length: scenario.burst }, async (_, index) => {
        if (scenario.mode === 'automatic') return { to: batchAddress(index) }
        if (scenario.mode === 'expiring')
          return {
            nonceKey: 'expiring' as const,
            to: batchAddress(index),
          }

        const nonceKey =
          scenario.mode === 'independent'
            ? scenario.nonceKey + BigInt(index)
            : scenario.nonceKey
        const nonce = await Actions.nonce.getNonce(client, {
          account: account.address,
          nonceKey,
        })
        return {
          nonce: Number(nonce) + (scenario.mode === 'sequential' ? index : 0),
          nonceKey,
          to: batchAddress(index),
        }
      }),
    )

    const receipts =
      scenario.mode === 'sequential'
        ? await (async () => {
            const receipts = []
            for (const request of parameters)
              receipts.push(await sendTransactionSync(client, request as never))
            return receipts
          })()
        : await Promise.all(
            parameters.map((request) =>
              sendTransactionSync(client, request as never),
            ),
          )

    expect(receipts.every(({ status }) => status === 'success')).toBe(true)
    expect(
      new Set(receipts.map(({ transactionHash }) => transactionHash)),
    ).toHaveLength(receipts.length)
    for (const receipt of receipts)
      expect(receipt.from).toBe(account.address.toLowerCase())

    const transactions = await Promise.all(
      receipts.map(({ transactionHash }) =>
        getTransaction(client, { hash: transactionHash }),
      ),
    )

    for (const [index, transaction] of transactions.entries()) {
      expect(transaction.from).toBe(account.address.toLowerCase())
      if (scenario.mode === 'automatic' || scenario.mode === 'expiring') {
        expect(transaction.nonceKey).toBe(maxUint256)
        expect(transaction.nonce).toBe(0)
        expect(transaction.validBefore).toBeTypeOf('number')
        continue
      }

      expect(transaction.nonceKey).toBe(
        scenario.mode === 'independent'
          ? scenario.nonceKey + BigInt(index)
          : scenario.nonceKey,
      )
      expect(transaction.nonce).toBe(parameters[index]?.nonce)
    }
  })

  test.prop(sponsorshipScenario, {
    ...nodeParameters(),
    examples: [
      { accountIndex: 1, burst: 2, policy: 'sign-only' },
      { accountIndex: 10, burst: 2, policy: 'sign-only' },
      { accountIndex: 1, burst: 5, policy: 'sign-only' },
      { accountIndex: 10, burst: 5, policy: 'sign-only' },
      { accountIndex: 1, burst: 2, policy: 'sign-and-broadcast' },
      { accountIndex: 10, burst: 2, policy: 'sign-and-broadcast' },
      { accountIndex: 1, burst: 5, policy: 'sign-and-broadcast' },
      { accountIndex: 10, burst: 5, policy: 'sign-and-broadcast' },
    ],
  })(
    'executes sponsored bursts through both relay policies',
    async ({ accountIndex, burst, policy }) => {
      const batchAddress = nextAddressBatch()
      const feePayerClient = getClient({ account: accounts[0] })
      const relayMethods: string[] = []
      const relayTransport = custom(
        {
          async request(request) {
            const { method, params } = request
            relayMethods.push(method)
            if (method === 'eth_fillTransaction')
              return feePayerClient.request(request as never)

            const serialized = params[0] as `0x76${string}`
            const transaction = Transaction.deserialize(serialized)
            const signedTransaction = await signTransaction(feePayerClient, {
              ...transaction,
              feePayer: feePayerClient.account,
            } as never)

            if (method === 'eth_signRawTransaction') return signedTransaction
            return feePayerClient.request({
              method,
              params: [signedTransaction],
            } as never)
          },
        },
        { retryCount: 0 },
      )
      const client = getClient({
        account: accounts[accountIndex],
        transport: withRelay(http(), relayTransport, { policy }),
      })

      const receipts = await Promise.all(
        Array.from({ length: burst }, (_, index) =>
          sendTransactionSync(client, {
            feePayer: true,
            to: batchAddress(index),
          }),
        ),
      )

      expect(receipts.every(({ status }) => status === 'success')).toBe(true)
      expect(
        new Set(receipts.map(({ transactionHash }) => transactionHash)),
      ).toHaveLength(receipts.length)
      expect(
        relayMethods.filter((method) => method !== 'eth_fillTransaction'),
      ).toEqual(
        Array.from({ length: burst }, () =>
          policy === 'sign-only'
            ? 'eth_signRawTransaction'
            : 'eth_sendRawTransactionSync',
        ),
      )
      expect(
        relayMethods.filter((method) => method === 'eth_fillTransaction'),
      ).toHaveLength(burst)

      const transactions = await Promise.all(
        receipts.map(({ transactionHash }) =>
          getTransaction(feePayerClient, { hash: transactionHash }),
        ),
      )
      for (const transaction of transactions) {
        expect(transaction.from).toBe(
          accounts[accountIndex].address.toLowerCase(),
        )
        expect(transaction.nonceKey).toBe(maxUint256)
        expect(transaction.nonce).toBe(0)
        expect(transaction.feePayerSignature).toBeDefined()
      }
      for (const receipt of receipts) {
        expect(receipt.from).toBe(accounts[accountIndex].address.toLowerCase())
        expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
      }
    },
  )
})

function address(index: number) {
  return `0x${(index + 100).toString(16).padStart(40, '0')}` as const
}

let transactionSequence = 0
function nextAddressBatch() {
  const offset = transactionSequence * 100
  transactionSequence += 1
  return (index: number) => address(offset + index)
}
