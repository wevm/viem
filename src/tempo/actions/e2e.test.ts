import * as P256 from 'ox/P256'
import * as Secp256k1 from 'ox/Secp256k1'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions, Client, custom } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import * as Account from '../Account.js'
import * as Addresses from '../Addresses.js'
import type { Envelope } from '../chainConfig.js'

const accounts = tempo.accounts
const to = '0x00000000000000000000000000000000000000ff'

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
        abi: [
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
        ],
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

      console.error(
        'STEP: envelope',
        JSON.stringify(request, (_, v) =>
          typeof v === 'bigint' ? v.toString() : v,
        ),
      )
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

  // v2 e2e parity ports pending implementation.
  test.todo('root p256 sender: transaction round-trips')
  test.todo('root webCrypto sender: transaction round-trips')
  test.todo('root webAuthn sender: transaction round-trips')
  test.todo('contract deploy')
  test.todo('contract deploy with `feeToken` (tempo tx)')
  test.todo('2D nonces: explicit nonceKey round-trips on-chain')
  test.todo('access key + `feePayer` combo')
  test.todo('transaction.get decodes via the chain transaction codec')
  test.todo('sign-only `transaction.sign` for an unfunded account')

  // Blocked on later waves.
  test.todo(
    'relay: sign-only + sign-and-broadcast policies (W6 Transport.withRelay)',
  )
  test.todo('access key periodic spending limits (W5e accessKey.authorize)')
  test.todo('zone.encryptedDeposit.prepare (W5e zone actions)')
})

/** JSON-RPC method-not-found error (forces the manual prepare path). */
class RpcError_MethodNotFound extends Error {
  code = -32601
  override message = 'Method not found'
}
