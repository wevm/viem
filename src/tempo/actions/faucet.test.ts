import { afterEach, describe, expect, test, vi } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { createClient } from '../../clients/createClient.js'
import { createTransport } from '../../clients/transports/createTransport.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import * as waitForTransactionReceipt from '../../actions/public/waitForTransactionReceipt.js'
import * as faucet from './faucet.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function getClient(request = vi.fn(async () => null)) {
  return createClient({
    transport: () =>
      createTransport({
        key: 'mock',
        name: 'Mock Transport',
        request: request as unknown as EIP1193RequestFn,
        type: 'mock',
      }),
  })
}

describe('fund', () => {
  test('requests faucet funding for the provided address', async () => {
    const hashes = [
      '0x1111111111111111111111111111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222222222222222222222222222',
    ] as const
    const request = vi.fn(async () => hashes)
    const client = getClient(request)

    const result = await faucet.fund(client, {
      account: '0x000000000000000000000000000000000000dEaD',
    })

    expect(result).toEqual(hashes)
    expect(request).toHaveBeenCalledWith({
      method: 'tempo_fundAddress',
      params: ['0x000000000000000000000000000000000000dEaD'],
    })
  })
})

describe('fundSync', () => {
  test('waits for all funding transactions with the default timeout', async () => {
    const hashes = [
      '0x1111111111111111111111111111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222222222222222222222222222',
    ] as const
    const receipts = [
      { transactionHash: hashes[0], status: 'success' },
      { transactionHash: hashes[1], status: 'success' },
    ] as const
    const request = vi.fn(async () => hashes)
    const client = getClient(request)
    const account = privateKeyToAccount(
      '0x59c6995e998f97a5a0044966f0945382dbf90f1d7e6c0b0f8f7f52fa16b0d6d2',
    )
    const waitForTransactionReceiptSpy = vi
      .spyOn(waitForTransactionReceipt, 'waitForTransactionReceipt')
      .mockResolvedValueOnce(receipts[0] as never)
      .mockResolvedValueOnce(receipts[1] as never)

    const result = await faucet.fundSync(client, {
      account,
    })

    expect(result).toEqual(receipts)
    expect(request).toHaveBeenCalledWith({
      method: 'tempo_fundAddress',
      params: [account.address],
    })
    expect(waitForTransactionReceiptSpy).toHaveBeenNthCalledWith(1, client, {
      hash: hashes[0],
      checkReplacement: false,
      timeout: 10_000,
    })
    expect(waitForTransactionReceiptSpy).toHaveBeenNthCalledWith(2, client, {
      hash: hashes[1],
      checkReplacement: false,
      timeout: 10_000,
    })
  })
})
