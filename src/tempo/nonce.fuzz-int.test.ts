import { Secp256k1 } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'
import { fc, test } from '@fast-check/vitest'
import * as tempo from '~test/tempo.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import { Actions, custom } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions as tempo_Actions,
  Client,
  http,
  withRelay,
} from 'viem/tempo'
import { afterAll, beforeAll, describe, expect } from 'vitest'

const maxUint256 = 2n ** 256n - 1n
const node = tempo.defineNode()
let rpcUrl: string

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

beforeAll(async () => {
  rpcUrl = await node.start()
})
afterAll(() => node.stop())

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
    const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
    const client = tempo.getClient({ account, rpcUrl })
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
        const nonce = await tempo_Actions.nonce.get(client, {
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
              receipts.push(
                await Actions.transaction.sendSync(client, request as never),
              )
            return receipts
          })()
        : await Promise.all(
            parameters.map((request) =>
              Actions.transaction.sendSync(client, request as never),
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
        Actions.transaction.get(client, { hash: transactionHash }),
      ),
    )

    for (const [index, transaction] of transactions.entries()) {
      expect(transaction.from).toBe(account.address.toLowerCase())
      if (scenario.mode === 'automatic' || scenario.mode === 'expiring') {
        expect(transaction.nonceKey).toBe(maxUint256)
        expect(transaction.nonce).toBe(0n)
        expect(transaction.validBefore).toBeTypeOf('number')
        continue
      }

      expect(transaction.nonceKey).toBe(
        scenario.mode === 'independent'
          ? scenario.nonceKey + BigInt(index)
          : scenario.nonceKey,
      )
      expect(transaction.nonce).toBe(BigInt(parameters[index]!.nonce!))
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
      const feePayerKey = tempo.accounts[0]!.privateKey
      const feePayer = Account.fromSecp256k1(feePayerKey)
      const feePayerClient = tempo.getClient({ account: feePayer, rpcUrl })
      const relayMethods: string[] = []
      const relayTransport = custom({
        async request(request) {
          const { method, params } = request
          relayMethods.push(method)
          if (method === 'eth_fillTransaction')
            return feePayerClient.request(request as never)

          const serialized = params[0] as `0x78${string}`
          const envelope = TxEnvelopeTempo.deserialize(
            `0x76${serialized.slice(4)}`,
          )
          const feePayerSignature = Secp256k1.sign({
            payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
              sender: envelope.from!,
            }),
            privateKey: feePayerKey,
          })
          const signedTransaction = TxEnvelopeTempo.serialize({
            ...envelope,
            feePayerSignature,
          })

          if (method === 'eth_signRawTransaction') return signedTransaction
          return feePayerClient.request({
            method,
            params: [signedTransaction],
          } as never)
        },
      })
      const account = Account.fromSecp256k1(
        tempo.accounts[accountIndex]!.privateKey,
      )
      const client = Client.create({
        account,
        chain: tempoLocalnet,
        feeToken: tempo.pathUsd,
        pollingInterval: 100,
        transport: withRelay(http(rpcUrl), relayTransport, { policy }),
      })

      const receipts = await Promise.all(
        Array.from({ length: burst }, (_, index) =>
          Actions.transaction.sendSync(client, {
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
          Actions.transaction.get(feePayerClient, { hash: transactionHash }),
        ),
      )
      for (const transaction of transactions) {
        expect(transaction.from).toBe(account.address.toLowerCase())
        expect(transaction.nonceKey).toBe(maxUint256)
        expect(transaction.nonce).toBe(0n)
        expect(transaction.feePayerSignature).toBeDefined()
      }
      for (const receipt of receipts) {
        expect(receipt.from).toBe(account.address.toLowerCase())
        expect(receipt.feePayer).toBe(feePayer.address.toLowerCase())
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
