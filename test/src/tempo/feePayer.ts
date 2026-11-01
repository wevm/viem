import { createRequestListener } from '@remix-run/node-fetch-server'
import { P256 } from 'ox'
import { createClient, http, maxUint256, zeroAddress } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  fillTransaction,
  getTransaction,
  prepareTransactionRequest,
  sendRawTransactionSync,
  sendTransactionSync,
} from 'viem/actions'
import { Account, Relay, withRelay } from 'viem/tempo'
import { expect } from 'vitest'
import { createHttpServer } from '../utils.js'
import * as Tempo from './config.js'

/** Route that sponsors and delivers the transaction. */
export const paths = [
  'external',
  'fill',
  'local',
  'sign-and-broadcast',
  'sign-only',
] as const

/** Nonce lane and discriminator the sender requests. */
export const nonceModes = [
  'expiring',
  'expiring-nonce',
  'lane',
  'protocol',
  'unset',
] as const

/** Validity bounds the sender requests. */
export const validities = ['before', 'unset', 'window'] as const

/** Fee token the sender requests, and whether the sponsor configures its own. */
export const feeTokens = ['sender', 'sponsor', 'unset'] as const

/** Gas limit the sender requests. */
export const gases = ['sender', 'unset'] as const

/** Sender key type. */
export const keys = ['p256', 'secp256k1'] as const

/** Mutations of a fee-payer-signed transaction before the sender signs it. */
export const tampers = [
  'calls',
  'gas',
  'maxFeePerGas',
  'nonce',
  'validBefore',
] as const

export type Scenario = {
  feeToken: (typeof feeTokens)[number]
  gas: (typeof gases)[number]
  key: (typeof keys)[number]
  nonceMode: (typeof nonceModes)[number]
  path: (typeof paths)[number]
  validity: (typeof validities)[number]
}

export const sponsor = Tempo.accounts[0]!

const caller = Tempo.getClient({ chain: Tempo.chain })
const expiringNonceMaxExpiry = 300
const senderGas = 1_000_000n
const senderToken = Tempo.addresses.alphaUsd
const sponsorToken = Tempo.addresses.pathUsd

/** Returns every path and nonce mode pair, cycling the remaining dimensions so each value appears. */
export function table(): readonly Scenario[] {
  return paths.flatMap((path, i) =>
    nonceModes.map((nonceMode, j) => {
      const index = i * nonceModes.length + j
      return {
        feeToken: feeTokens[index % feeTokens.length]!,
        gas: gases[(index + i) % gases.length]!,
        key: keys[(index + j) % keys.length]!,
        nonceMode,
        path,
        validity: validities[(index + i + j) % validities.length]!,
      }
    }),
  )
}

/** Sends a sponsored transaction for `scenario` and asserts the result against the protocol rules. */
export async function assertScenario(scenario: Scenario) {
  const { feeToken, gas, nonceMode, path, validity } = scenario
  const now = Math.floor(Date.now() / 1000)
  const sender = createSender(scenario)
  const lane = BigInt(1 + Math.floor(Math.random() * 2 ** 48))
  const request = {
    account: sender,
    calls: [{ to: zeroAddress }],
    ...(gas === 'sender' ? { gas: senderGas } : {}),
    ...(feeToken !== 'unset' ? { feeToken: senderToken } : {}),
    ...(nonceMode === 'expiring' ? { nonceKey: 'expiring' as const } : {}),
    ...(nonceMode === 'expiring-nonce'
      ? { nonce: 42, nonceKey: 'expiring' as const }
      : {}),
    ...(nonceMode === 'lane' ? { nonceKey: lane } : {}),
    ...(nonceMode === 'protocol' ? { nonceKey: 0n } : {}),
    ...(validity === 'before' ? { validBefore: now + 60 } : {}),
    ...(validity === 'window'
      ? { validAfter: now - 10, validBefore: now + 60 }
      : {}),
  }
  const expiring = nonceMode !== 'lane' && nonceMode !== 'protocol'

  // Raw co-signing requires the sender to bound its own signature.
  if (path === 'sign-only' && !expiring && validity === 'unset') {
    await expect(send(scenario, request)).rejects.toThrow(
      'Sponsored transactions require a `validBefore` within 3600 seconds.',
    )
    return
  }

  const receipt = await send(scenario, request)
  const transaction = await getTransaction(caller, {
    hash: receipt.transactionHash,
  })

  expect(receipt.status).toBe('success')
  expect(receipt.from).toBe(sender.address.toLowerCase())
  expect(receipt.feePayer).toBe(sponsor.address.toLowerCase())

  if (expiring) {
    expect.soft(transaction.nonceKey).toBe(maxUint256)
    expect.soft(transaction.validBefore).toBeGreaterThan(now)
    expect
      .soft(transaction.validBefore)
      .toBeLessThanOrEqual(now + expiringNonceMaxExpiry + 5)
  }
  if (nonceMode === 'expiring-nonce') expect.soft(transaction.nonce).toBe(42n)
  if (nonceMode === 'lane') expect.soft(transaction.nonceKey).toBe(lane)
  if (nonceMode === 'protocol') expect.soft(transaction.nonceKey).toBe(0n)

  if (validity !== 'unset') expect.soft(transaction.validBefore).toBe(now + 60)
  if (validity === 'window') expect.soft(transaction.validAfter).toBe(now - 10)
  if (validity === 'before') expect.soft(transaction.validAfter).toBeNull()

  // Sponsorship reserves gas for the fee payer's signature, so a sender's gas is a floor.
  if (gas === 'sender')
    expect.soft(transaction.gas).toBeGreaterThanOrEqual(senderGas)

  // The fee payer chooses the fee token, so only a sponsor-configured token is guaranteed.
  if (feeToken === 'sponsor' && path !== 'local')
    expect
      .soft(transaction.feeToken?.toLowerCase())
      .toBe(sponsorToken.toLowerCase())
}

/** Asserts that changing a signed field after the fee payer signs keeps the transaction off chain. */
export async function assertTamperRejected(tamper: (typeof tampers)[number]) {
  const sender = Account.fromSecp256k1(generatePrivateKey())
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.feePayer({ account: sponsor })],
    }),
  })
  const { transaction } = await fillTransaction(client, {
    account: sender.address,
    calls: [{ to: zeroAddress }],
    feePayer: true,
    nonce: 1,
    nonceKey: 'expiring',
  })
  expect(transaction.feePayerSignature).toBeDefined()

  const tampered = {
    ...transaction,
    ...(tamper === 'calls'
      ? { calls: [{ data: '0x01', to: zeroAddress }] as const }
      : {}),
    ...(tamper === 'gas' ? { gas: transaction.gas! + 1n } : {}),
    ...(tamper === 'maxFeePerGas'
      ? { maxFeePerGas: transaction.maxFeePerGas! + 1n }
      : {}),
    ...(tamper === 'nonce' ? { nonce: 2 } : {}),
    ...(tamper === 'validBefore'
      ? { validBefore: Number(transaction.validBefore) - 1 }
      : {}),
  }

  await expect(
    sendRawTransactionSync(caller, {
      serializedTransaction: await sender.signTransaction(tampered as never),
    }),
  ).rejects.toThrow()
}

declare namespace send {
  type Request = Record<string, unknown> & {
    account: ReturnType<typeof createSender>
  }
}

function createSender(scenario: Scenario) {
  if (scenario.key === 'p256') return Account.fromP256(P256.randomPrivateKey())
  return Account.fromSecp256k1(generatePrivateKey())
}

async function send(scenario: Scenario, request: send.Request) {
  const { feeToken, path } = scenario
  const plugins = [
    Relay.feePayer({
      account: sponsor,
      ...(feeToken === 'sponsor' ? { feeToken: sponsorToken } : {}),
    }),
  ]

  if (path === 'local')
    return sendTransactionSync(caller, {
      ...request,
      feePayer: sponsor,
    } as never)

  if (path === 'fill') {
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), { plugins }),
    })
    return sendTransactionSync(client, {
      ...request,
      feePayer: true,
    } as never)
  }

  const upstream = Relay.create({ client: caller, plugins })
  const server = await createHttpServer(createRequestListener(upstream.fetch))
  try {
    if (path === 'external') {
      const client = createClient({
        chain: Tempo.chain,
        transport: withRelay(Tempo.http(), {
          plugins: [
            Relay.feePayer({
              allowedFeePayers: [server.url],
              internal_allowUnsafeUrls: true,
            }),
          ],
        }),
      })
      return await sendTransactionSync(client, {
        ...request,
        feePayer: server.url,
      } as never)
    }

    // The sender signs before the relay co-signs.
    const prepared = await prepareTransactionRequest(caller, {
      ...request,
      feePayer: true,
    } as never)
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), http(server.url), { policy: path }),
    })
    return await sendRawTransactionSync(client, {
      serializedTransaction: await request.account.signTransaction(
        prepared as never,
      ),
    })
  } finally {
    await server.close()
  }
}
