import { P256, Secp256k1, WebCryptoP256 } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'
import { createServer } from '~test/http.js'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions, Client, custom, http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Actions as tempo_Actions } from 'viem/tempo'
import * as Account from '../Account.js'
import * as Addresses from '../Addresses.js'
import type { Envelope } from '../chainConfig.js'
import { withRelay } from '../Transport.js'

const accounts = tempo.accounts
const to = '0x00000000000000000000000000000000000000ff'

const transferAbi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

/** Funds `address` with pathUSD from dev account 0. */
async function fund(address: `0x${string}`, amount = 10_000_000n) {
  await Actions.contract.writeSync(tempo.getClient(), {
    abi: transferAbi,
    address: Addresses.pathUsd,
    args: [address, amount],
    feeToken: tempo.pathUsd,
    functionName: 'transfer',
  })
}

/**
 * End-to-end signing gate: every account kind flows through the chain hooks
 * (`toEnvelope` → `getSignPayload` → `serialize`) and the prepare hook
 * (fee tokens, expiring nonces, key authorizations, multisig senders).
 */
describe('transaction.sendSync', () => {
  test('root secp256k1: transaction round-trips', async () => {
    const client = tempo.getClient()
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.type).toBe('tempo')
  })

  test('fee token: paid in a non-default token', async () => {
    const client = tempo.getClient({
      account: Account.fromSecp256k1(accounts[1]!.privateKey),
    })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.alphaUsd,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.feeToken?.toLowerCase()).toBe(tempo.alphaUsd)
  })

  test('expiring nonce: concurrent-safe transaction', async () => {
    const client = tempo.getClient({
      account: Account.fromSecp256k1(accounts[2]!.privateKey),
    })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
      nonceKey: 'expiring',
    })
    expect(receipt.status).toBe('success')
  })

  test('access key (secp256k1): inline key authorization', async () => {
    const root = Account.fromSecp256k1(accounts[3]!.privateKey)
    const accessKey = Secp256k1.randomPrivateKey()
    const account = Account.fromSecp256k1(accessKey, { access: root })

    const keyAuthorization = await Account.signKeyAuthorization(root, {
      chainId: tempoLocalnet.id,
      key: account,
    })

    const client = tempo.getClient({ account })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
      keyAuthorization,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from.toLowerCase()).toBe(root.address.toLowerCase())
  })

  test('access key (p256): inline key authorization', async () => {
    const root = Account.fromSecp256k1(accounts[4]!.privateKey)
    const accessKey = P256.randomPrivateKey()
    const account = Account.fromP256(accessKey, { access: root })

    const keyAuthorization = await Account.signKeyAuthorization(root, {
      chainId: tempoLocalnet.id,
      key: account,
    })

    const client = tempo.getClient({ account })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
      keyAuthorization,
    })
    expect(receipt.status).toBe('success')
  })

  test('access key (headless WebAuthn): inline key authorization', async () => {
    const root = Account.fromSecp256k1(accounts[5]!.privateKey)
    const accessKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(accessKey, {
      access: root,
      origin: 'https://localhost',
      rpId: 'localhost',
    })

    const keyAuthorization = await Account.signKeyAuthorization(root, {
      chainId: tempoLocalnet.id,
      key: account,
    })

    const client = tempo.getClient({ account })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
      keyAuthorization,
    })
    expect(receipt.status).toBe('success')
  })

  test('fee payer: local account co-signs the fee', async () => {
    const feePayer = Account.fromSecp256k1(accounts[6]!.privateKey)
    const sender = Account.fromSecp256k1(accounts[7]!.privateKey)

    const client = tempo.getClient({ account: sender })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feePayer,
      feeToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.feePayer?.toLowerCase()).toBe(feePayer.address.toLowerCase())
  })

  // Native multisig (TIP-1061) runs only on a multisig-capable node: the
  // public node image has no `0x05` (multisig) signature-envelope decoding
  // yet, so it rejects the transaction with `failed to decode signed
  // transaction`. Opt in with `VITE_TEMPO_MULTISIG=true` against a
  // multisig-enabled node. (The combining itself is covered hermetically in
  // `chainConfig.test.ts`.)
  test.runIf(process.env.VITE_TEMPO_MULTISIG)(
    'multisig (2-of-2): owner approvals combine into the envelope',
    async () => {
      const owner1 = Account.fromSecp256k1(accounts[8]!.privateKey)
      const owner2 = Account.fromSecp256k1(accounts[9]!.privateKey)
      const account = Account.fromMultisig({
        threshold: 2,
        owners: [
          { owner: owner1.address, weight: 1 },
          { owner: owner2.address, weight: 1 },
        ],
      })

      // Fund the derived multisig account with the fee token.
      const funder = tempo.getClient({ account: owner1 })
      await Actions.contract.writeSync(funder, {
        abi: transferAbi,
        address: Addresses.pathUsd,
        args: [account.address, 10_000_000n],
        feeToken: tempo.pathUsd,
        functionName: 'transfer',
      })

      const client = tempo.getClient({ account })
      const { request } = await Actions.transaction.prepare(client, {
        account,
        calls: [{ to }],
        feeToken: tempo.pathUsd,
      })

      const envelope = tempoLocalnet.transaction.toEnvelope(
        request as never,
      ) as Envelope
      const approvals = [
        await owner1.signTransaction(envelope as never, {
          chain: tempoLocalnet,
        }),
        await owner2.signTransaction(envelope as never, {
          chain: tempoLocalnet,
        }),
      ]

      const serialized = await account.signTransaction(
        { ...envelope, signatures: approvals } as never,
        { chain: tempoLocalnet },
      )
      const receipt = await Actions.transaction.sendRawSync(client, {
        transaction: serialized,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from.toLowerCase()).toBe(account.address.toLowerCase())
    },
  )

  test('estimateGas: explicit fee fields', async () => {
    const client = tempo.getClient()
    const request = {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
    } as const

    // Fee fields are forwarded to the node (v2 stripped them for
    // `eth_estimateGas`): for funded senders they do not affect the estimate.
    const [plain, withFees] = await Promise.all([
      Actions.transaction.estimateGas(client, { ...request } as never),
      Actions.transaction.estimateGas(client, {
        ...request,
        maxFeePerGas: 20_000_000_000n,
        maxPriorityFeePerGas: 0n,
      }),
    ])
    expect(withFees).toBe(plain)

    // The node caps estimable gas by the sender balance when fee fields are
    // present — even under sponsorship (`feePayer: true`), where the sender
    // holds nothing. Estimating for unfunded senders must omit fee fields
    // (the fill path does).
    const unfunded = Account.fromSecp256k1(
      '0x0000000000000000000000000000000000000000000000000000000000000069',
    )
    await expect(
      Actions.transaction.estimateGas(client, {
        ...request,
        account: unfunded,
        feePayer: true,
        maxFeePerGas: 20_000_000_000n,
        maxPriorityFeePerGas: 0n,
      } as never),
    ).rejects.toThrow('gas required exceeds allowance')
    await expect(
      Actions.transaction.estimateGas(client, {
        ...request,
        account: unfunded,
        feePayer: true,
      } as never),
    ).resolves.toBeGreaterThan(0n)
  })

  test('prepare: manual fallback estimates gas fee-less for sponsored senders', async () => {
    // A transport that rejects `eth_fillTransaction` forces the manual
    // prepare path, where core fills fees before gas. The chain hook must
    // estimate gas without fee fields, or the node caps the estimate by the
    // (empty) sender balance.
    const http = tempo.getClient()
    const transport = custom({
      async request({ method, params }) {
        if (method === 'eth_fillTransaction')
          throw new RpcError_MethodNotFound()
        return await http.request({ method, params })
      },
    })
    const unfunded = Account.fromSecp256k1(
      '0x000000000000000000000000000000000000000000000000000000000000006a',
    )
    const client = Client.create({
      account: unfunded,
      chain: tempoLocalnet,
      transport,
    })

    const { request } = await Actions.transaction.prepare(client, {
      calls: [{ to }],
      feePayer: true,
      feeToken: tempo.pathUsd,
    })
    expect(request.gas).toBeGreaterThan(0n)
    expect(request.maxFeePerGas).toBeGreaterThan(0n)
  })

  test('root p256 sender: transaction round-trips', async () => {
    const sender = Account.fromP256(P256.randomPrivateKey())
    await fund(sender.address)

    const client = tempo.getClient({ account: sender })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from.toLowerCase()).toBe(sender.address.toLowerCase())
  })

  test('root webCrypto sender: transaction round-trips', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const sender = Account.fromWebCryptoP256(keyPair)
    await fund(sender.address)

    const client = tempo.getClient({ account: sender })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from.toLowerCase()).toBe(sender.address.toLowerCase())
  })

  test('root webAuthn sender: transaction round-trips', async () => {
    const sender = Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
      origin: 'https://localhost',
      rpId: 'localhost',
    })
    await fund(sender.address)

    const client = tempo.getClient({ account: sender })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from.toLowerCase()).toBe(sender.address.toLowerCase())
  })

  test('contract deploy', async () => {
    const client = tempo.getClient()
    const receipt = await Actions.contract.deploySync(client, {
      abi: [],
      bytecode: '0x60006000f3',
    })
    expect(receipt.status).toBe('success')
    expect(receipt.contractAddress).toBeTruthy()
  })

  test('contract deploy with `feeToken` (tempo tx)', async () => {
    const client = tempo.getClient()
    const receipt = await Actions.contract.deploySync(client, {
      abi: [],
      bytecode: '0x60006000f3',
      feeToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.type).toBe('tempo')
    expect(receipt.contractAddress).toBeTruthy()
  })

  test('2D nonces: explicit nonceKey round-trips on-chain', async () => {
    const client = tempo.getClient({
      account: Account.fromSecp256k1(accounts[2]!.privateKey),
    })
    const nonceKey = 42n

    const before = await tempo_Actions.nonce.get(client, { nonceKey })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
      nonceKey,
    })
    expect(receipt.status).toBe('success')
    expect(await tempo_Actions.nonce.get(client, { nonceKey })).toBe(
      before + 1n,
    )
  })

  test('access key + `feePayer` combo', async () => {
    const root = Account.fromSecp256k1(accounts[3]!.privateKey)
    const account = Account.fromSecp256k1(Secp256k1.randomPrivateKey(), {
      access: root,
    })
    const keyAuthorization = await Account.signKeyAuthorization(root, {
      chainId: tempoLocalnet.id,
      key: account,
    })
    const feePayer = Account.fromSecp256k1(accounts[6]!.privateKey)

    const client = tempo.getClient({ account })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feePayer,
      feeToken: tempo.pathUsd,
      keyAuthorization,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from.toLowerCase()).toBe(root.address.toLowerCase())
    expect(receipt.feePayer?.toLowerCase()).toBe(feePayer.address.toLowerCase())
  })

  test('transaction.get decodes via the chain transaction codec', async () => {
    const client = tempo.getClient()
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
    })

    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.type).toBe('tempo')
    expect(transaction.hash).toBe(receipt.transactionHash)
    expect(transaction.feeToken?.toLowerCase()).toBe(tempo.pathUsd)
    expect(transaction.calls?.[0]?.to?.toLowerCase()).toBe(to)
  })

  test('sign-only `transaction.sign` for an unfunded account', async () => {
    const sender = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
    const client = tempo.getClient({ account: sender })

    const serialized = await Actions.transaction.sign(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
      prepare: true,
    })

    expect(serialized.startsWith('0x76')).toBe(true)
    const envelope = TxEnvelopeTempo.deserialize(serialized as `0x76${string}`)
    expect(envelope.from?.toLowerCase()).toBe(sender.address.toLowerCase())
    expect(envelope.feeToken?.toLowerCase()).toBe(tempo.pathUsd)
    expect(envelope.calls[0]?.to?.toLowerCase()).toBe(to)
  })

  test('access key periodic spending limits (W5e accessKey.authorize)', async () => {
    const root = Account.fromSecp256k1(accounts[5]!.privateKey)
    const rootClient = tempo.getClient({
      account: root,
      feeToken: tempo.pathUsd,
    })
    const accessKey = Account.fromP256(P256.randomPrivateKey(), {
      access: root,
    })

    await tempo_Actions.accessKey.authorizeSync(rootClient, {
      accessKey,
      expiry: Math.floor(Date.now() / 1000) + 60,
      limits: [{ limit: 10_000_000n, period: 3600, token: tempo.pathUsd }],
    })

    const { periodEnd, remaining } =
      await tempo_Actions.accessKey.getRemainingLimit(rootClient, {
        account: root.address,
        accessKey,
        token: tempo.pathUsd,
      })
    expect(remaining).toBe(10_000_000n)
    expect(periodEnd).toBeGreaterThan(0n)

    // Fees spent under the key draw down the periodic limit.
    const keyClient = tempo.getClient({ account: accessKey })
    const receipt = await Actions.transaction.sendSync(keyClient, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')

    const after = await tempo_Actions.accessKey.getRemainingLimit(rootClient, {
      account: root.address,
      accessKey,
      token: tempo.pathUsd,
    })
    expect(after.remaining).toBeLessThan(10_000_000n)
  })
})

/**
 * Relay transport gate: a sponsored transaction from an unfunded sender
 * flows through `withRelay`: fill via the relay, fee payer co-signature,
 * and broadcast per policy.
 */
describe('withRelay', () => {
  const feePayerKey = accounts[6]!.privateKey
  const feePayer = Account.fromSecp256k1(feePayerKey)

  /** Boots a relay: co-signs fee payer handoffs, proxies the rest to the node. */
  async function createRelayServer() {
    const methods: string[] = []

    // The fee payer handoff format (`0x78`) shares the `0x76` body; swap the
    // type byte to decode, then co-sign as the fee payer.
    function cosign(serialized: string) {
      const envelope = TxEnvelopeTempo.deserialize(`0x76${serialized.slice(4)}`)
      const sender = envelope.from!
      const feePayerSignature = Secp256k1.sign({
        payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, { sender }),
        privateKey: feePayerKey,
      })
      return TxEnvelopeTempo.serialize({ ...envelope, feePayerSignature })
    }

    const server = await createServer((req, res) => {
      let body = ''
      req.setEncoding('utf8')
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', async () => {
        const request = JSON.parse(body)
        methods.push(request.method)

        const respond = (json: unknown) => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(json))
        }

        try {
          if (request.method === 'eth_signRawTransaction')
            return respond({
              id: request.id,
              jsonrpc: '2.0',
              result: cosign(request.params[0]),
            })

          // Raw submissions carry the handoff payload; co-sign before
          // proxying. Everything else (e.g. `eth_fillTransaction`) proxies
          // verbatim.
          const params =
            request.method === 'eth_sendRawTransaction' ||
            request.method === 'eth_sendRawTransactionSync'
              ? [cosign(request.params[0])]
              : request.params

          const response = await fetch(tempo.rpcUrl, {
            body: JSON.stringify({ ...request, params }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          respond(await response.json())
        } catch (error) {
          respond({
            error: { code: -32000, message: (error as Error).message },
            id: request.id,
            jsonrpc: '2.0',
          })
        }
      })
    })
    return { ...server, methods }
  }

  test.each(['sign-only', 'sign-and-broadcast'] as const)(
    'policy: %s',
    async (policy) => {
      const relay = await createRelayServer()
      try {
        // Sponsorship covers the fee; the sender holds nothing.
        const sender = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
        const client = Client.create({
          account: sender,
          chain: tempoLocalnet,
          pollingInterval: 100,
          transport: withRelay(http(tempo.rpcUrl), http(relay.url), {
            policy,
          }),
        })

        const receipt = await Actions.transaction.sendSync(client, {
          calls: [{ to }],
          feePayer: true,
        })

        expect(receipt.status).toBe('success')
        expect(receipt.from.toLowerCase()).toBe(sender.address.toLowerCase())
        expect(receipt.feePayer?.toLowerCase()).toBe(
          feePayer.address.toLowerCase(),
        )
        expect(relay.methods).toEqual([
          'eth_fillTransaction',
          policy === 'sign-only'
            ? 'eth_signRawTransaction'
            : 'eth_sendRawTransactionSync',
        ])
      } finally {
        await relay.close()
      }
    },
  )
})

/** JSON-RPC method-not-found error (forces the manual prepare path). */
class RpcError_MethodNotFound extends Error {
  code = -32601
  override message = 'Method not found'
}
