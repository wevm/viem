import {
  getTransaction,
  prepareTransactionRequest,
  sendTransactionSync,
} from 'viem/actions'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'

const client = getClient({
  account: accounts.at(0)!,
})

describe('prepareTransactionRequest', () => {
  test('behavior: sequential nonce keys for feePayer transactions', async () => {
    const requests = await Promise.all([
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, { feePayer: true }),
    ])

    expect(requests[0]?.nonceKey).toBe(0n)
    expect(requests[1]?.nonceKey).toBeGreaterThan(0n)
    expect(requests[2]?.nonceKey).toBeGreaterThan(0n)
  })

  test('behavior: nonce key counter resets after event loop tick', async () => {
    const requests1 = await Promise.all([
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, { feePayer: true }),
    ])

    expect(requests1[0]?.nonceKey).toBe(0n)
    expect(requests1[1]?.nonceKey).toBeGreaterThan(0n)

    // Wait for microtask queue to flush
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)))

    const requests2 = await Promise.all([
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, { feePayer: true }),
    ])

    // Counter should have reset
    expect(requests2[0]?.nonceKey).toBe(0n)
    expect(requests2[1]?.nonceKey).toBeGreaterThan(0n)
  })

  test('behavior: explicit nonceKey overrides counter', async () => {
    const requests = await Promise.all([
      prepareTransactionRequest(client, {
        feePayer: true,
        nonceKey: 42n,
      }),
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, {
        feePayer: true,
        nonceKey: 100n,
      }),
    ])

    expect(requests[0]?.nonceKey).toBe(42n)
    expect(requests[1]?.nonceKey).toBe(0n)
    expect(requests[2]?.nonceKey).toBe(100n)
  })

  test('behavior: default nonceKey when feePayer is not true', async () => {
    const request = await prepareTransactionRequest(client, {})
    expect(request?.nonceKey).toBe(undefined)
  })

  test('behavior: nonce with sequential nonceKey', async () => {
    const requests = await Promise.all([
      prepareTransactionRequest(client, { feePayer: true }), // nonceKey: 0n
      prepareTransactionRequest(client, { feePayer: true }), // nonceKey: 1n
      prepareTransactionRequest(client, { feePayer: true }), // nonceKey: 2n
    ])

    expect(requests[0]?.nonce).toBe(0)
    expect(requests[0]?.nonceKey).toBe(0n)

    // nonceKey >= 1n is truthy, so nonce is 0
    expect(requests[1]?.nonce).toBe(0)
    expect(requests[1]?.nonceKey).toBeGreaterThan(0n)

    expect(requests[2]?.nonce).toBe(0)
    expect(requests[2]?.nonceKey).toBeGreaterThan(0n)
  })

  test('behavior: explicit nonce is preserved', async () => {
    const request = await prepareTransactionRequest(client, {
      feePayer: true,
      nonce: 123,
    })
    expect(request?.nonce).toBe(123)
    expect(request?.nonceKey).toBe(0n)
  })

  test('behavior: default nonceKey is 0n (falsy)', async () => {
    const request = await prepareTransactionRequest(client, {})
    expect(request?.nonceKey).toBe(undefined)
    expect(request?.nonce).toBe(0)
  })

  test('behavior: sendTransaction', async () => {
    const receipts = await Promise.all([
      sendTransactionSync(client, {
        to: '0x0000000000000000000000000000000000000000',
      }),
      sendTransactionSync(client, {
        to: '0x0000000000000000000000000000000000000001',
      }),
      sendTransactionSync(client, {
        to: '0x0000000000000000000000000000000000000002',
      }),
    ])
    const transactions = await Promise.all([
      getTransaction(client, {
        hash: receipts[0].transactionHash,
      }),
      getTransaction(client, {
        hash: receipts[1].transactionHash,
      }),
      getTransaction(client, {
        hash: receipts[2].transactionHash,
      }),
    ])
    expect(transactions[0].nonceKey).toBe(undefined)
    expect(transactions[1].nonceKey).toBeGreaterThan(0n)
    expect(transactions[2].nonceKey).toBeGreaterThan(0n)
  })
})
