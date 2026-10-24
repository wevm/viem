/**
 * Live checks for the AA transaction type (`viem/eip8130`) against a local
 * devnet running the split spec: value in calls, delegation `0x01`, named and
 * open payers, nonce-free mode, receipt status semantics.
 *
 *   VIBENET_RPC=http://127.0.0.1:8545 FAUCET_PK=0x... \
 *     ./node_modules/.bin/vitest run --config test/vitest.eip8130.config.ts \
 *       scripts/eip8130/aaTxLive.test.ts
 */
import { beforeAll, describe, expect, test } from 'vitest'
import {
  generatePrivateKey,
  privateKeyToAccount,
} from '../../src/accounts/index.js'
import { getBalance } from '../../src/actions/public/getBalance.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { getTransactionReceipt as coreGetTransactionReceipt } from '../../src/actions/public/getTransactionReceipt.js'
import { waitForTransactionReceipt as coreWaitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { sendTransaction as coreSendTransaction } from '../../src/actions/wallet/sendTransaction.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import {
  eip8130Actions,
  eip8130ChainConfig,
  estimateGas,
  getTransaction,
  nonceKeyMax,
  openPayer,
  register8130Chains,
  sendTransaction,
  sendTransactionSync,
  toEoaAccount,
  waitForTransactionReceipt,
} from '../../src/eip8130/index.js'
import type { Hex } from '../../src/types/misc.js'
import { defineChain } from '../../src/utils/chain/defineChain.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'

const RPC = process.env.VIBENET_RPC
const rpcUrl = RPC ?? 'http://127.0.0.1:8545'
const FAUCET_PK = process.env.FAUCET_PK as Hex | undefined

// Runtime `PUSH1 0 PUSH1 0 REVERT`, behind a 12-byte init stub.
const reverterInitCode = '0x6005600c60003960056000f360006000fd' as const
const zeroAddress = '0x0000000000000000000000000000000000000000' as const

describe.runIf(RPC && FAUCET_PK)('live: AA transaction type', () => {
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
  let reverter: Hex

  // Faucet sends are serialized so the faucet's own nonce never races.
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

  function freshEoa() {
    return toEoaAccount(privateKeyToAccount(generatePrivateKey()))
  }

  async function fees() {
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    const baseFee = BigInt(block!.baseFeePerGas ?? '0x0')
    return {
      maxFeePerGas: baseFee * 2n + 1_000_000n,
      maxPriorityFeePerGas: 1_000_000n,
    }
  }

  beforeAll(async () => {
    register8130Chains(chain.id)
    const hash = await coreSendTransaction(client, {
      account: faucet,
      chain,
      data: reverterInitCode,
    })
    const receipt = await coreWaitForTransactionReceipt(client, { hash })
    reverter = receipt.contractAddress!
    expect(await getCode(client, { address: reverter })).toBe('0x60006000fd')
  }, 60_000)

  test('self-pay: value calls land, move value, and round-trip via getTransaction', async () => {
    const account = freshEoa()
    await fund(account.address)
    const a = privateKeyToAccount(generatePrivateKey()).address
    const b = privateKeyToAccount(generatePrivateKey()).address

    const calls = [
      { to: a, value: 1_000n },
      { to: b, value: 2_000n, data: '0x' as const },
    ]
    const gas = await estimateGas(client, {
      sender: account.address,
      calls: [calls],
    })
    const hash = await sendTransaction(client, {
      account,
      calls,
      gas,
      ...(await fees()),
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    expect(receipt.status).toBe('0x1')
    expect(receipt.eip8130.phaseStatuses).toEqual(['0x1'])
    expect(receipt.eip8130.payer?.toLowerCase()).toBe(
      account.address.toLowerCase(),
    )
    expect(await getBalance(client, { address: a })).toBe(1_000n)
    expect(await getBalance(client, { address: b })).toBe(2_000n)

    const tx = await getTransaction(client, { hash })
    expect(tx.calls?.[0]?.map((call) => call.value)).toEqual([1_000n, 2_000n])
  }, 120_000)

  test('estimate: each value-bearing call adds TX_VALUE_COST', async () => {
    const account = freshEoa()
    await fund(account.address)
    const to = privateKeyToAccount(generatePrivateKey()).address
    // Fund `to` first so the account-creation charge does not apply.
    await fund(to, 1n)
    const withoutValue = await estimateGas(client, {
      sender: account.address,
      calls: [[{ to }]],
    })
    const withValue = await estimateGas(client, {
      sender: account.address,
      calls: [[{ to, value: 1n }]],
    })
    console.log('gas: no value', withoutValue, 'with value', withValue)
    expect(withValue).toBeGreaterThan(withoutValue)
  }, 120_000)

  test('phases: a reverting phase gives status 0 but earlier phases persist', async () => {
    const account = freshEoa()
    await fund(account.address)
    const kept = privateKeyToAccount(generatePrivateKey()).address
    const dropped = privateKeyToAccount(generatePrivateKey()).address

    const calls = [
      [{ to: kept, value: 5n }],
      [{ to: dropped, value: 7n }, { to: reverter }],
      [{ to: dropped, value: 9n }],
    ]
    // The node rejects estimating a reverting phase, like `eth_estimateGas`.
    await expect(
      estimateGas(client, { sender: account.address, calls }),
    ).rejects.toThrow()
    const hash = await sendTransaction(client, {
      account,
      calls,
      gas: 300_000n,
      ...(await fees()),
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    console.log('phases       :', receipt.status, receipt.eip8130.phaseStatuses)
    expect(receipt.status).toBe('0x0')
    expect(receipt.eip8130.phaseStatuses).toEqual(['0x1', '0x0', '0x0'])
    expect(await getBalance(client, { address: kept })).toBe(5n)
    expect(await getBalance(client, { address: dropped })).toBe(0n)

    const coreReceipt = await coreGetTransactionReceipt(client, { hash })
    expect(coreReceipt.status).toBe('reverted')
  }, 120_000)

  test('delegation 0x01: sets and clears EIP-7702-style code', async () => {
    const account = freshEoa()
    await fund(account.address)

    const set = [account.delegate(reverter)]
    const gasSet = await estimateGas(client, {
      sender: account.address,
      accountChanges: set,
      calls: [],
    })
    const setHash = await sendTransaction(client, {
      account,
      accountChanges: set,
      calls: [],
      gas: gasSet,
      ...(await fees()),
    })
    const setReceipt = await waitForTransactionReceipt(client, {
      hash: setHash,
    })
    expect(setReceipt.status).toBe('0x1')
    expect(await getCode(client, { address: account.address })).toBe(
      `0xef0100${reverter.slice(2).toLowerCase()}`,
    )

    // Calling the delegated account now runs the reverter's code.
    const callHash = await sendTransaction(client, {
      account,
      calls: [{ to: account.address }],
      gas: 200_000n,
      ...(await fees()),
    })
    const callReceipt = await waitForTransactionReceipt(client, {
      hash: callHash,
    })
    expect(callReceipt.eip8130.phaseStatuses).toEqual(['0x0'])

    const clear = [account.delegate(zeroAddress)]
    const gasClear = await estimateGas(client, {
      sender: account.address,
      accountChanges: clear,
      calls: [],
    })
    const clearHash = await sendTransaction(client, {
      account,
      accountChanges: clear,
      calls: [],
      gas: gasClear,
      ...(await fees()),
    })
    expect(
      (await waitForTransactionReceipt(client, { hash: clearHash })).status,
    ).toBe('0x1')
    expect(await getCode(client, { address: account.address })).toBeOneOf([
      undefined,
      '0x',
    ])
  }, 180_000)

  test('named payer: a zero-balance sender sends value paid by the sponsor', async () => {
    const sender = freshEoa()
    const sponsor = privateKeyToAccount(generatePrivateKey())
    // Value comes from the sender, gas from the sponsor.
    await fund(sender.address, 10_000n)
    await fund(sponsor.address)
    const to = privateKeyToAccount(generatePrivateKey()).address

    const calls = [{ to, value: 10_000n }]
    const gas = await estimateGas(client, {
      sender: sender.address,
      calls: [calls],
      payer: sponsor.address,
    })
    const hash = await sendTransaction(client, {
      account: sender,
      calls,
      gas,
      payer: { account: sponsor },
      ...(await fees()),
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    expect(receipt.status).toBe('0x1')
    expect(receipt.eip8130.payer?.toLowerCase()).toBe(
      sponsor.address.toLowerCase(),
    )
    expect(await getBalance(client, { address: sender.address })).toBe(0n)
    expect(await getBalance(client, { address: to })).toBe(10_000n)
  }, 120_000)

  test('open payer: any signer pays; receipt reports the recovered payer', async () => {
    const sender = freshEoa()
    const sponsor = privateKeyToAccount(generatePrivateKey())
    await fund(sponsor.address)
    const to = privateKeyToAccount(generatePrivateKey()).address

    const calls = [{ to }]
    const gas = await estimateGas(client, {
      sender: sender.address,
      calls: [calls],
      payer: openPayer,
    })
    const hash = await sendTransaction(client, {
      account: sender,
      calls,
      gas,
      payer: { account: sponsor, address: openPayer },
      ...(await fees()),
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    expect(receipt.status).toBe('0x1')
    expect(receipt.eip8130.payer?.toLowerCase()).toBe(
      sponsor.address.toLowerCase(),
    )
    expect(await getBalance(client, { address: sender.address })).toBe(0n)

    const tx = await getTransaction(client, { hash })
    expect(tx.payer).toBe(openPayer)
  }, 120_000)

  test('open payer: sender-signed tx completed later by a sponsor', async () => {
    const sender = freshEoa()
    const sponsor = privateKeyToAccount(generatePrivateKey())
    await fund(sponsor.address)

    const { prepareTransactionRequest } = await import(
      '../../src/eip8130/actions/sendTransaction.js'
    )
    const { signTransaction } = await import(
      '../../src/eip8130/utils/signTransaction.js'
    )
    const { parseTransaction } = await import(
      '../../src/eip8130/utils/parseTransaction.js'
    )
    const tx = await prepareTransactionRequest(client, {
      account: sender,
      calls: [[{ to: sender.address }]],
      gas: 200_000n,
      ...(await fees()),
    })
    tx.payer = openPayer
    const senderSigned = await sender.signTransaction(tx)

    // The sponsor only sees the serialized envelope.
    const serialized = await signTransaction({
      transaction: parseTransaction(senderSigned),
      payer: { account: sponsor, address: openPayer },
    })
    const hash = await client.request({
      method: 'eth_sendRawTransaction',
      params: [serialized],
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    expect(receipt.status).toBe('0x1')
    expect(receipt.eip8130.payer?.toLowerCase()).toBe(
      sponsor.address.toLowerCase(),
    )
  }, 120_000)

  test('nonce-free: lands anchored to block time; expired validBefore is rejected', async () => {
    const account = freshEoa()
    await fund(account.address)
    const block = await client.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    })
    const nowMs = BigInt(block!.timestamp) * 1000n

    const hash = await sendTransaction(client, {
      account,
      calls: [{ to: account.address }],
      gas: 200_000n,
      nonceKey: nonceKeyMax,
      now: nowMs,
      ...(await fees()),
    })
    expect((await waitForTransactionReceipt(client, { hash })).status).toBe(
      '0x1',
    )

    await expect(
      sendTransaction(client, {
        account,
        calls: [{ to: account.address }],
        gas: 200_000n,
        nonceKey: nonceKeyMax,
        validBefore: nowMs - 3_600_000n,
        ...(await fees()),
      }),
    ).rejects.toThrow()
  }, 120_000)

  test('2D nonces: parallel channels land independently', async () => {
    const account = freshEoa()
    await fund(account.address)
    const f = await fees()
    const hashes = await Promise.all(
      [1n, 2n, 3n].map((nonceKey) =>
        sendTransaction(client, {
          account,
          calls: [{ to: account.address }],
          gas: 200_000n,
          nonceKey,
          ...f,
        }),
      ),
    )
    for (const hash of hashes)
      expect((await waitForTransactionReceipt(client, { hash })).status).toBe(
        '0x1',
      )
  }, 120_000)

  test('core client.sendTransaction (chainConfig) sends value with auto gas', async () => {
    const account = freshEoa()
    await fund(account.address)
    const to = privateKeyToAccount(generatePrivateKey()).address
    const hash = await coreSendTransaction(client, {
      account,
      calls: [{ to, value: 123n }],
      ...(await fees()),
    } as never)
    const receipt = await coreGetTransactionReceipt(client, { hash })
      .catch(() => undefined)
      .then(
        async (r) => r ?? (await waitForTransactionReceipt(client, { hash })),
      )
    expect(['success', '0x1']).toContain(receipt.status)
    expect(await getBalance(client, { address: to })).toBe(123n)
  }, 120_000)

  test('sendTransactionSync returns the receipt with eip8130 fields', async () => {
    const account = freshEoa()
    await fund(account.address)
    const receipt = await sendTransactionSync(client, {
      account,
      calls: [{ to: account.address }],
      gas: 200_000n,
      ...(await fees()),
    })
    expect(receipt.status).toBe('success')
    expect(receipt.eip8130?.phaseStatuses).toEqual(['0x1'])
  }, 120_000)

  test('metadata: echoed on the receipt', async () => {
    const account = freshEoa()
    await fund(account.address)
    const hash = await sendTransaction(client, {
      account,
      calls: [{ to: account.address }],
      gas: 200_000n,
      dataSuffix: '0xc0ffee',
      ...(await fees()),
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    expect(receipt.eip8130.metadata).toBe('0xc0ffee')
  }, 120_000)
})
