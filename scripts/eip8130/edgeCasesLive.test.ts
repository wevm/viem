/**
 * Live edge cases for the AA transaction type (`viem/eip8130`): JSON-RPC shape,
 * estimate request handling, admission rejections, replay, phases and payers.
 *
 *   VIBENET_RPC=http://127.0.0.1:8545 FAUCET_PK=0x... \
 *     ./node_modules/.bin/vitest run --config test/vitest.eip8130.config.ts \
 *       scripts/eip8130/edgeCasesLive.test.ts
 */
import { beforeAll, describe, expect, test } from 'vitest'
import {
  generatePrivateKey,
  privateKeyToAccount,
} from '../../src/accounts/index.js'
import { getBalance } from '../../src/actions/public/getBalance.js'
import { waitForTransactionReceipt as coreWaitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { sendTransaction as coreSendTransaction } from '../../src/actions/wallet/sendTransaction.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { prepareTransactionRequest } from '../../src/eip8130/actions/sendTransaction.js'
import {
  eip8130Actions,
  eip8130ChainConfig,
  getTransaction,
  nonceKeyMax,
  openPayer,
  register8130Chains,
  toEoaAccount,
  waitForTransactionReceipt,
} from '../../src/eip8130/index.js'
import { parseTransaction } from '../../src/eip8130/utils/parseTransaction.js'
import { serializeTransaction } from '../../src/eip8130/utils/serializeTransaction.js'
import { signTransaction } from '../../src/eip8130/utils/signTransaction.js'
import type { Hex } from '../../src/types/misc.js'
import { defineChain } from '../../src/utils/chain/defineChain.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'

const RPC = process.env.VIBENET_RPC
const rpcUrl = RPC ?? 'http://127.0.0.1:8545'
const FAUCET_PK = process.env.FAUCET_PK as Hex | undefined

const zeroAddress = '0x0000000000000000000000000000000000000000' as const

/** Raw JSON-RPC, so node responses and error messages are seen unwrapped. */
async function rpc(method: string, params: unknown[]) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  return (await response.json()) as {
    result?: any
    error?: { code: number; message: string; data?: unknown }
  }
}

function errorOf(r: Awaited<ReturnType<typeof rpc>>) {
  return r.error
    ? `${r.error.message}${r.error.data ? ` ${r.error.data}` : ''}`
    : undefined
}

describe.runIf(RPC && FAUCET_PK)('live: AA transaction edge cases', () => {
  const chain = defineChain({
    ...eip8130ChainConfig,
    id: 84538453,
    name: 'Base Vibenet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  })
  const client = createClient({ chain, transport: http(rpcUrl) }).extend(
    eip8130Actions(),
  )
  const faucet = privateKeyToAccount(FAUCET_PK ?? `0x${'01'.padStart(64, '0')}`)

  let faucetQueue: Promise<unknown> = Promise.resolve()
  function fund(address: Hex, value = parseEther('1')) {
    const next = faucetQueue.then(async () => {
      const hash = await coreSendTransaction(client, {
        account: faucet,
        chain,
        to: address,
        value,
      })
      return coreWaitForTransactionReceipt(client, { hash })
    })
    faucetQueue = next.catch(() => {})
    return next
  }

  /** An EOA-path AA account that also works as a raw `signTransaction` signer. */
  function freshEoa() {
    const signer = privateKeyToAccount(generatePrivateKey())
    return Object.assign(toEoaAccount(signer), { sign: signer.sign })
  }

  function randomAddress() {
    return privateKeyToAccount(generatePrivateKey()).address
  }

  async function latestBlock() {
    return (await rpc('eth_getBlockByNumber', ['latest', false])).result
  }

  async function fees() {
    const block = await latestBlock()
    const baseFee = BigInt(block.baseFeePerGas ?? '0x0')
    return {
      maxFeePerGas: baseFee * 2n + 1_000_000n,
      maxPriorityFeePerGas: 1_000_000n,
    }
  }

  async function build(
    account: ReturnType<typeof freshEoa>,
    overrides: Partial<Parameters<typeof prepareTransactionRequest>[1]> = {},
  ) {
    return prepareTransactionRequest(client, {
      account,
      calls: [[{ to: account.address }]],
      gas: 200_000n,
      ...(await fees()),
      ...overrides,
    })
  }

  async function sendRaw(serialized: Hex) {
    return rpc('eth_sendRawTransaction', [serialized])
  }

  beforeAll(() => {
    register8130Chains(chain.id)
  })

  describe('JSON-RPC shape', () => {
    test('transaction, block and receipt use the flat, quantity-encoded shape', async () => {
      const sender = freshEoa()
      const sponsor = privateKeyToAccount(generatePrivateKey())
      await fund(sponsor.address)
      const target = randomAddress()

      const tx = await build(sender, {
        accountChanges: [sender.delegate(target)],
        calls: [[{ to: target, value: 0n, data: '0xdead' }]],
      })
      tx.payer = openPayer
      const serialized = await signTransaction({
        transaction: tx,
        account: sender,
        payer: { account: sponsor, address: openPayer },
      })
      const { result: hash } = await sendRaw(serialized)
      const receipt = await waitForTransactionReceipt(client, { hash })

      const raw = (await rpc('eth_getTransactionByHash', [hash])).result
      console.log('tx json:', JSON.stringify(raw))
      expect(raw.tx).toBeUndefined()
      for (const field of [
        'chainId',
        'nonce',
        'gas',
        'validAfter',
        'validBefore',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
        'nonceKey',
        'value',
      ])
        expect(raw[field], field).toMatch(/^0x[0-9a-f]+$/)
      expect(raw.to).toBeNull()
      expect(raw.input).toBe('0x')
      expect(raw.accountChanges).toEqual([
        { type: '0x1', target: target.toLowerCase() },
      ])
      expect(raw.calls[0][0].data).toBe('0xdead')
      expect(raw.hash).toBe(hash)
      expect(raw.from.toLowerCase()).toBe(sender.address.toLowerCase())
      console.log('open payer in tx json:', raw.payer)

      const block = (await rpc('eth_getBlockByNumber', [raw.blockNumber, true]))
        .result
      const inBlock = block.transactions.find((t: any) => t.hash === hash)
      expect(inBlock).toEqual(raw)
      const byIndex = (
        await rpc('eth_getTransactionByBlockNumberAndIndex', [
          raw.blockNumber,
          raw.transactionIndex,
        ])
      ).result
      expect(byIndex).toEqual(raw)

      const rawReceipt = (await rpc('eth_getTransactionReceipt', [hash])).result
      console.log('receipt eip8130 fields:', {
        to: rawReceipt.to,
        payer: rawReceipt.payer,
        phaseStatuses: rawReceipt.phaseStatuses,
        metadata: rawReceipt.metadata,
        contractAddress: rawReceipt.contractAddress,
      })
      expect(rawReceipt.to).toBeNull()
      expect(rawReceipt.payer.toLowerCase()).toBe(sponsor.address.toLowerCase())
      expect(receipt.eip8130.phaseStatuses).toEqual(['0x1'])

      const typed = await getTransaction(client, { hash })
      expect(typed.payer).toBe(openPayer)
      expect(typed.accountChanges).toEqual([
        { type: 'delegation', target: target.toLowerCase() },
      ])
      expect(typed.calls).toEqual([
        [{ to: target.toLowerCase(), data: '0xdead' }],
      ])
    }, 120_000)

    test('empty calls: status 1 and phaseStatuses []', async () => {
      const account = freshEoa()
      await fund(account.address)
      const tx = await build(account, { calls: [] })
      const { result: hash, error } = await sendRaw(
        await signTransaction({ transaction: tx, account }),
      )
      expect(error).toBeUndefined()
      const raw =
        (await rpc('eth_getTransactionReceipt', [hash])).result ??
        (await waitForTransactionReceipt(client, { hash }),
        (await rpc('eth_getTransactionReceipt', [hash])).result)
      console.log('empty calls receipt:', raw.status, raw.phaseStatuses)
      expect(raw.status).toBe('0x1')
      expect(raw.phaseStatuses).toEqual([])
    }, 120_000)
  })

  describe('eth_estimateGas', () => {
    test('top-level to/data/value prices the same as one call', async () => {
      const sender = freshEoa()
      await fund(sender.address)
      const to = randomAddress()
      await fund(to, 1n)
      const data = `0x${'ff'.repeat(32)}` as const
      const topLevel = await rpc('eth_estimateGas', [
        { type: '0x79', sender: sender.address, to, data, value: '0x1' },
        'pending',
      ])
      const asCall = await rpc('eth_estimateGas', [
        {
          type: '0x79',
          sender: sender.address,
          calls: [[{ to, data, value: '0x1' }]],
        },
        'pending',
      ])
      console.log('top-level vs calls:', topLevel.result, asCall.result)
      expect(topLevel.error).toBeUndefined()
      expect(topLevel.result).toBe(asCall.result)
    }, 60_000)

    test('mixing a top-level call with calls is rejected', async () => {
      const sender = freshEoa()
      const r = await rpc('eth_estimateGas', [
        {
          type: '0x79',
          sender: sender.address,
          to: randomAddress(),
          calls: [[{ to: randomAddress(), data: '0x' }]],
        },
        'pending',
      ])
      console.log('mixed:', errorOf(r))
      expect(r.error).toBeDefined()
    })

    test('errors name their cause', async () => {
      const sender = freshEoa()
      const cases = {
        mismatch: {
          type: '0x79',
          sender: sender.address,
          from: randomAddress(),
          calls: [],
        },
        oversizedSenderAuth: {
          type: '0x79',
          sender: sender.address,
          senderAuth: `0x${'ff'.repeat(9000)}`,
          calls: [],
        },
        unknownPayerAuthenticator: {
          type: '0x79',
          sender: sender.address,
          payer: randomAddress(),
          payerAuth: `0x${'ab'.repeat(20)}${'ff'.repeat(65)}`,
          calls: [],
        },
        oversizedOpenPayerAuth: {
          type: '0x79',
          sender: sender.address,
          payer: zeroAddress,
          payerAuth: `0x${'ff'.repeat(9000)}`,
          calls: [],
        },
      }
      const messages: Record<string, string | undefined> = {}
      for (const [name, request] of Object.entries(cases))
        messages[name] = errorOf(
          await rpc('eth_estimateGas', [request, 'pending']),
        )
      console.log('estimate errors:', messages)
      for (const message of Object.values(messages))
        expect(message).toBeDefined()

      // An open payer has not signed yet when the sender estimates, so the node
      // prices a stub for a missing (or unrecoverable) `payerAuth`.
      const open = async (extra: object) =>
        rpc('eth_estimateGas', [
          { type: '0x79', sender: sender.address, calls: [], ...extra },
          'pending',
        ])
      const stubbed = await open({ payer: zeroAddress })
      const badAuth = await open({
        payer: zeroAddress,
        payerAuth: `0x${'ff'.repeat(65)}`,
      })
      const short = await open({ payer: '0x00' })
      console.log('open payer estimates (stub, bad auth, "0x00"):', {
        stubbed: stubbed.result ?? errorOf(stubbed),
        badAuth: badAuth.result ?? errorOf(badAuth),
        short: short.result ?? errorOf(short),
      })
      expect(stubbed.error).toBeUndefined()
      expect(short.result).toBe(stubbed.result)
      expect(new Set(Object.values(messages)).size).toBe(
        Object.keys(messages).length,
      )
    })

    test('integer fields accept quantities and JSON numbers', async () => {
      const sender = freshEoa()
      const calls = [[{ to: sender.address, data: '0x' }]]
      const validBefore = Number((await latestBlock()).timestamp) + 3600
      const hex = await rpc('eth_estimateGas', [
        {
          type: '0x79',
          sender: sender.address,
          validBefore: `0x${validBefore.toString(16)}`,
          nonceKey: '0x1',
          calls,
        },
        'pending',
      ])
      const num = await rpc('eth_estimateGas', [
        {
          type: '0x79',
          sender: sender.address,
          validBefore,
          nonceKey: 1,
          calls,
        },
        'pending',
      ])
      console.log(
        'quantities vs numbers:',
        hex.result ?? errorOf(hex),
        num.result ?? errorOf(num),
      )
      expect(hex.error).toBeUndefined()
      expect(num.result).toBe(hex.result)
    })

    test('an elapsed validity window is rejected', async () => {
      const sender = freshEoa()
      const r = await rpc('eth_estimateGas', [
        {
          type: '0x79',
          sender: sender.address,
          validBefore: '0x10',
          nonceKey: '0x1',
          calls: [[{ to: sender.address, data: '0x' }]],
        },
        'pending',
      ])
      expect(r.error?.code).toBe(-32602)
      expect(r.error?.message).toContain('validity window has already elapsed')
    })

    test('nonce-free: core client.sendTransaction lands with auto gas', async () => {
      const account = freshEoa()
      await fund(account.address)
      const hash = await coreSendTransaction(client, {
        account,
        calls: [{ to: account.address }],
        nonceKey: nonceKeyMax,
        ...(await fees()),
      } as never)
      const receipt = await waitForTransactionReceipt(client, { hash })
      const tx = await getTransaction(client, { hash })
      console.log(
        'core nonce-free: gas',
        tx.gas,
        'used',
        receipt.gasUsed,
        'validBefore',
        tx.validBefore,
      )
      expect(receipt.status).toBe('0x1')
    }, 120_000)
  })

  describe('admission', () => {
    test('rejects bad signatures, wrong chain, low gas and expired windows', async () => {
      const account = freshEoa()
      await fund(account.address)
      const results: Record<string, string | undefined> = {}

      const good = await build(account)
      const signed = parseTransaction(
        await signTransaction({ transaction: good, account }),
      )
      const flipped = `${signed.senderAuth!.slice(0, 10)}${
        signed.senderAuth![10] === 'a' ? 'b' : 'a'
      }${signed.senderAuth!.slice(11)}` as Hex
      results.tamperedSenderAuth = errorOf(
        await sendRaw(serializeTransaction({ ...signed, senderAuth: flipped })),
      )
      results.bodyChangedAfterSigning = errorOf(
        await sendRaw(
          serializeTransaction({
            ...signed,
            calls: [[{ to: randomAddress() }]],
          }),
        ),
      )

      results.wrongChainId = errorOf(
        await sendRaw(
          await signTransaction({
            transaction: { ...(await build(account)), chainId: 1 },
            account,
          }),
        ),
      )
      results.gasBelowIntrinsic = errorOf(
        await sendRaw(
          await signTransaction({
            transaction: await build(account, { gas: 21_000n }),
            account,
          }),
        ),
      )
      const nowMs = BigInt((await latestBlock()).timestamp) * 1000n
      results.expiredValidBefore = errorOf(
        await sendRaw(
          await signTransaction({
            transaction: await build(account, { validBefore: nowMs - 60_000n }),
            account,
          }),
        ),
      )
      // viem refuses to sign a nonce-free transaction without a deadline.
      await expect(
        signTransaction({
          transaction: {
            ...(await build(account, { nonceKey: nonceKeyMax })),
            validBefore: 0n,
          },
          account,
        }),
      ).rejects.toThrow('must be non-zero')
      results.nonceFreeTooFarAhead = errorOf(
        await sendRaw(
          await signTransaction({
            transaction: await build(account, {
              nonceKey: nonceKeyMax,
              validBefore: nowMs + 3_600_000n,
            }),
            account,
          }),
        ),
      )
      results.feeCapBelowTip = errorOf(
        await sendRaw(
          await signTransaction({
            transaction: await build(account, {
              maxFeePerGas: 1n,
              maxPriorityFeePerGas: 2n,
            }),
            account,
          }),
        ),
      )
      console.log('admission rejections:', results)
      for (const [name, message] of Object.entries(results))
        expect(message, name).toBeDefined()
    }, 120_000)

    test('validity window: future validAfter, and bounds given in seconds', async () => {
      const account = freshEoa()
      await fund(account.address)
      const nowS = BigInt((await latestBlock()).timestamp)

      const future = await sendRaw(
        await signTransaction({
          transaction: await build(account, {
            validAfter: (nowS + 3600n) * 1000n,
          }),
          account,
        }),
      )
      console.log('future validAfter:', future.result ?? errorOf(future))

      const seconds = await sendRaw(
        await signTransaction({
          transaction: await build(account, {
            nonceKey: 7n,
            validBefore: nowS + 600n,
          }),
          account,
        }),
      )
      console.log('validBefore in seconds:', seconds.result ?? errorOf(seconds))
      if (seconds.result) {
        const receipt = await waitForTransactionReceipt(client, {
          hash: seconds.result,
        })
        console.log('validBefore in seconds landed:', receipt.status)
      }
    }, 120_000)
  })

  describe('replay', () => {
    test('a landed transaction cannot be replayed (sequenced and nonce-free)', async () => {
      const account = freshEoa()
      await fund(account.address)

      const sequenced = await signTransaction({
        transaction: await build(account),
        account,
      })
      const first = await sendRaw(sequenced)
      expect(first.error).toBeUndefined()
      const duplicate = await sendRaw(sequenced)
      await waitForTransactionReceipt(client, { hash: first.result })
      const replay = await sendRaw(sequenced)

      const nowMs = BigInt((await latestBlock()).timestamp) * 1000n
      const nonceFree = await signTransaction({
        transaction: await build(account, {
          nonceKey: nonceKeyMax,
          validBefore: nowMs + 15_000n,
        }),
        account,
      })
      const nf = await sendRaw(nonceFree)
      expect(nf.error).toBeUndefined()
      await waitForTransactionReceipt(client, { hash: nf.result })
      const nfReplay = await sendRaw(nonceFree)

      console.log('replay:', {
        duplicateWhilePending: duplicate.result ?? errorOf(duplicate),
        sequencedReplay: errorOf(replay),
        nonceFreeReplay: errorOf(nfReplay),
      })
      expect(replay.error).toBeDefined()
      expect(nfReplay.error).toBeDefined()
    }, 120_000)

    test('an open payer signature cannot be reused for another sender', async () => {
      const alice = freshEoa()
      const bob = freshEoa()
      const sponsor = privateKeyToAccount(generatePrivateKey())
      await fund(sponsor.address)

      const tx = await build(alice)
      tx.payer = openPayer
      const signed = parseTransaction(
        await signTransaction({
          transaction: tx,
          account: alice,
          payer: { account: sponsor, address: openPayer },
        }),
      )
      const bobTx = await build(bob)
      bobTx.payer = openPayer
      const bobSigned = parseTransaction(
        await signTransaction({
          transaction: bobTx,
          account: bob,
          payer: { account: sponsor, address: openPayer },
        }),
      )
      const stolen = serializeTransaction({
        ...bobSigned,
        payerAuth: signed.payerAuth,
      })
      const r = await sendRaw(stolen)
      const recovered = r.result
        ? (await rpc('eth_getTransactionReceipt', [r.result])).result?.payer
        : undefined
      console.log('reused open payer auth:', r.result ?? errorOf(r), recovered)
      // Either rejected, or it recovers to someone other than the sponsor
      // (who never signed Bob's transaction) and fails for lack of funds.
      if (!r.error)
        expect(recovered?.toLowerCase()).not.toBe(sponsor.address.toLowerCase())
    }, 120_000)
  })

  describe('payers and value', () => {
    test('named payer: wrong key, and a payer that cannot cover gas', async () => {
      const sender = freshEoa()
      const sponsor = privateKeyToAccount(generatePrivateKey())
      const impostor = privateKeyToAccount(generatePrivateKey())
      await fund(sponsor.address)
      await fund(impostor.address)

      const tx = await build(sender)
      tx.payer = sponsor.address
      const wrongKey = await sendRaw(
        await signTransaction({
          transaction: tx,
          account: sender,
          payer: { account: impostor, address: sponsor.address },
        }),
      )
      const broke = privateKeyToAccount(generatePrivateKey())
      const brokeTx = await build(sender)
      brokeTx.payer = broke.address
      const unfunded = await sendRaw(
        await signTransaction({
          transaction: brokeTx,
          account: sender,
          payer: { account: broke },
        }),
      )
      console.log('named payer rejections:', {
        wrongKey: errorOf(wrongKey),
        unfunded: errorOf(unfunded),
      })
      expect(wrongKey.error).toBeDefined()
      expect(unfunded.error).toBeDefined()
    }, 120_000)

    test('call value the sender cannot cover reverts that phase at execution', async () => {
      const sender = freshEoa()
      const sponsor = privateKeyToAccount(generatePrivateKey())
      await fund(sender.address, 1_000n)
      await fund(sponsor.address)
      const a = randomAddress()
      const b = randomAddress()
      const tx = await build(sender, {
        calls: [[{ to: a, value: 600n }], [{ to: b, value: 600n }]],
        gas: 300_000n,
      })
      tx.payer = sponsor.address
      const sponsorBefore = await getBalance(client, {
        address: sponsor.address,
      })
      const r = await sendRaw(
        await signTransaction({
          transaction: tx,
          account: sender,
          payer: { account: sponsor },
        }),
      )
      // Admission checks only the payer's fees; the second phase overdraws
      // the sender and reverts, while the sponsor still pays for gas.
      expect(r.error).toBeUndefined()
      const receipt = await waitForTransactionReceipt(client, {
        hash: r.result,
      })
      console.log(
        'sum of values over balance:',
        receipt.status,
        receipt.eip8130.phaseStatuses,
      )
      expect(receipt.status).toBe('0x0')
      expect(receipt.eip8130.phaseStatuses).toEqual(['0x1', '0x0'])
      expect(await getBalance(client, { address: a })).toBe(600n)
      expect(await getBalance(client, { address: b })).toBe(0n)
      expect(
        await getBalance(client, { address: sponsor.address }),
      ).toBeLessThan(sponsorBefore)
    }, 120_000)

    test('sender naming itself as payer', async () => {
      const sender = freshEoa()
      await fund(sender.address)
      const tx = await build(sender)
      tx.payer = sender.address
      const r = await sendRaw(
        await signTransaction({
          transaction: tx,
          account: sender,
          payer: { account: sender },
        }),
      )
      console.log('self as named payer:', r.result ?? errorOf(r))
      if (r.result) {
        const receipt = await waitForTransactionReceipt(client, {
          hash: r.result,
        })
        console.log(
          'self as named payer landed:',
          receipt.status,
          receipt.eip8130.payer,
        )
      }
    }, 120_000)

    test('delegation and a call to the new code in the same transaction', async () => {
      const account = freshEoa()
      await fund(account.address)
      // Runtime `PUSH1 0 PUSH1 0 REVERT`.
      const deploy = await coreSendTransaction(client, {
        account: faucet,
        chain,
        data: '0x6005600c60003960056000f360006000fd',
      })
      const reverter = (
        await coreWaitForTransactionReceipt(client, { hash: deploy })
      ).contractAddress!
      const tx = await build(account, {
        accountChanges: [account.delegate(reverter)],
        calls: [[{ to: account.address }]],
      })
      const r = await sendRaw(
        await signTransaction({ transaction: tx, account }),
      )
      const receipt = await waitForTransactionReceipt(client, {
        hash: r.result,
      })
      console.log(
        'delegate + call:',
        receipt.status,
        receipt.eip8130.phaseStatuses,
      )
      // Account changes apply before calls, so the call runs the reverter.
      expect(receipt.eip8130.phaseStatuses).toEqual(['0x0'])
    }, 120_000)

    test('two delegations in one transaction', async () => {
      const account = freshEoa()
      await fund(account.address)
      const tx = await build(account, {
        accountChanges: [
          account.delegate(randomAddress()),
          account.delegate(randomAddress()),
        ],
      })
      // viem refuses to encode more than one delegation.
      await expect(
        signTransaction({ transaction: tx, account }),
      ).rejects.toThrow('At most one `delegation`')
    }, 60_000)

    test('large metadata', async () => {
      const account = freshEoa()
      await fund(account.address)
      const sizes: Record<number, string | undefined> = {}
      for (const size of [1_024, 32_768, 131_072]) {
        const tx = await build(account, {
          nonceKey: BigInt(100 + size),
          dataSuffix: `0x${'ab'.repeat(size)}`,
          gas: 5_000_000n,
        })
        const r = await sendRaw(
          await signTransaction({ transaction: tx, account }),
        )
        sizes[size] = r.result ? 'accepted' : errorOf(r)
      }
      console.log('metadata sizes:', sizes)
    }, 120_000)
  })
})
