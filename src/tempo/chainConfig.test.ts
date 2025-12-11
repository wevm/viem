import {
  getTransaction,
  prepareTransactionRequest,
  sendTransactionSync,
} from 'viem/actions'
import { describe, expect, test, vi } from 'vitest'
import {
  chain,
  client,
  clientWithAccount,
} from '../../test/src/tempo/config.js'

describe('chain.prepareTransactionRequest', () => {
  test('behavior: sequential nonce keys for feePayer transactions', async () => {
    const requests = await Promise.all([
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
    ])

    expect((requests[0] as any)?.nonceKey).toBe(undefined)
    expect((requests[1] as any)?.nonceKey).toBeGreaterThan(0n)
    expect((requests[2] as any)?.nonceKey).toBeGreaterThan(0n)
  })

  test('behavior: nonce key counter resets after event loop tick', async () => {
    const requests1 = await Promise.all([
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
    ])

    expect((requests1[0] as any)?.nonceKey).toBe(undefined)
    expect((requests1[1] as any)?.nonceKey).toBeGreaterThan(0n)

    // Wait for microtask queue to flush
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)))

    const requests2 = await Promise.all([
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
    ])

    // Counter should have reset
    expect((requests2[0] as any)?.nonceKey).toBe(undefined)
    expect((requests2[1] as any)?.nonceKey).toBeGreaterThan(0n)
  })

  test('behavior: explicit nonceKey overrides counter', async () => {
    const requests = await Promise.all([
      chain.prepareTransactionRequest({
        feePayer: true,
        nonceKey: 42n,
      } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({
        feePayer: true,
        nonceKey: 100n,
      } as never),
    ])

    expect((requests[0] as any)?.nonceKey).toBe(42n)
    expect((requests[1] as any)?.nonceKey).toBe(undefined)
    expect((requests[2] as any)?.nonceKey).toBe(100n)
  })

  test('behavior: default nonceKey when feePayer is not true', async () => {
    const request = await chain.prepareTransactionRequest({} as never)
    expect((request as any)?.nonceKey).toBe(undefined)
  })

  test('behavior: nonce with sequential nonceKey', async () => {
    const requests = await Promise.all([
      chain.prepareTransactionRequest({ feePayer: true } as never), // nonceKey: 0n
      chain.prepareTransactionRequest({ feePayer: true } as never), // nonceKey: 1n
      chain.prepareTransactionRequest({ feePayer: true } as never), // nonceKey: 2n
    ])

    // Note: 0n is falsy, so first request has nonce undefined
    expect((requests[0] as any)?.nonce).toBe(undefined)
    expect((requests[0] as any)?.nonceKey).toBe(undefined)

    // nonceKey >= 1n is truthy, so nonce is 0
    expect((requests[1] as any)?.nonce).toBe(0)
    expect((requests[1] as any)?.nonceKey).toBeGreaterThan(0n)

    expect((requests[2] as any)?.nonce).toBe(0)
    expect((requests[2] as any)?.nonceKey).toBeGreaterThan(0n)
  })

  test('behavior: explicit nonce is preserved', async () => {
    const request = await chain.prepareTransactionRequest({
      feePayer: true,
      nonce: 123,
    } as never)
    expect((request as any)?.nonce).toBe(123)
    expect((request as any)?.nonceKey).toBe(undefined)
  })

  test('behavior: default nonceKey is 0n (falsy)', async () => {
    const request = await chain.prepareTransactionRequest({} as never)
    expect((request as any)?.nonceKey).toBe(undefined)
    expect((request as any)?.nonce).toBe(undefined)
  })

  test('behavior: resetScheduled optimization - only one microtask scheduled', async () => {
    const queueMicrotaskSpy = vi.spyOn(globalThis, 'queueMicrotask')
    const callCountBefore = queueMicrotaskSpy.mock.calls.length

    // Prepare multiple transactions in parallel
    await Promise.all([
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
      chain.prepareTransactionRequest({ feePayer: true } as never),
    ])

    const callCountAfter = queueMicrotaskSpy.mock.calls.length

    // Only one microtask should have been scheduled for the reset
    expect(callCountAfter - callCountBefore).toBe(1)

    queueMicrotaskSpy.mockRestore()
  })

  describe('e2e', async () => {
    test('behavior: prepareTransactionRequest', async () => {
      const [request, request2, request3] = await Promise.all([
        prepareTransactionRequest(client, {
          to: '0x0000000000000000000000000000000000000000',
        }),
        prepareTransactionRequest(client, {
          to: '0x0000000000000000000000000000000000000000',
        }),
        prepareTransactionRequest(client, {
          to: '0x0000000000000000000000000000000000000000',
        }),
      ])
      expect(request.nonceKey).toBe(undefined)
      expect(request2.nonceKey).toBeGreaterThan(0n)
      expect(request3.nonceKey).toBeGreaterThan(0n)
    })

    test('behavior: sendTransaction', async () => {
      const receipts = await Promise.all([
        sendTransactionSync(clientWithAccount, {
          to: '0x0000000000000000000000000000000000000000',
        }),
        sendTransactionSync(clientWithAccount, {
          to: '0x0000000000000000000000000000000000000001',
        }),
        sendTransactionSync(clientWithAccount, {
          to: '0x0000000000000000000000000000000000000002',
        }),
      ])
      const transactions = await Promise.all([
        getTransaction(clientWithAccount, {
          hash: receipts[0].transactionHash,
        }),
        getTransaction(clientWithAccount, {
          hash: receipts[1].transactionHash,
        }),
        getTransaction(clientWithAccount, {
          hash: receipts[2].transactionHash,
        }),
      ])
      expect(transactions[0].nonceKey).toBe(0n)
      expect(transactions[1].nonceKey).toBeGreaterThan(0n)
      expect(transactions[2].nonceKey).toBeGreaterThan(0n)
    })
  })
})
