import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import {
  estimateGas,
  getTransaction,
  sendTransactionSync,
} from '../actions/index.js'
import * as Account from './Account.js'
import * as Formatters from './Formatters.js'

const client = getClient({
  account: accounts.at(0)!,
})

describe('formatTransaction', () => {
  test('behavior: non-tempo transaction', async () => {
    const receipt = await sendTransactionSync(client, {
      to: '0x0000000000000000000000000000000000000000',
    })
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.type).not.toBe('tempo')
  })

  test('behavior: tempo transaction', async () => {
    const feePayerClient = getClient({
      account: accounts.at(1)!,
    })
    const receipt = await sendTransactionSync(feePayerClient, {
      to: '0x0000000000000000000000000000000000000000',
      feePayer: accounts.at(0)!,
    })
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.type).toBe('tempo')
  })
})

describe('formatTransactionRequest', () => {
  test('behavior: webAuthn account populates keyType and keyData', async () => {
    const webAuthnAccount = Account.fromHeadlessWebAuthn(
      '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28',
      {
        rpId: 'localhost',
        origin: 'http://localhost',
      },
    )
    const webAuthnClient = getClient({
      account: webAuthnAccount,
    })
    const gas = await estimateGas(webAuthnClient, {
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(gas).toBeGreaterThan(0n)
  })

  test('behavior: p256 account populates keyType', async () => {
    const p256Account = Account.fromP256(
      '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28',
    )
    const p256Client = getClient({
      account: p256Account,
    })
    const gas = await estimateGas(p256Client, {
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(gas).toBeGreaterThan(0n)
  })

  test('behavior: estimateGas action clears fee fields', async () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxFeePerGas: 1000n,
        maxPriorityFeePerGas: 100n,
      } as never,
      'estimateGas',
    )
    expect(rpc.maxFeePerGas).toBeUndefined()
    expect(rpc.maxPriorityFeePerGas).toBeUndefined()
  })

  test('behavior: unknown account source returns no keyType', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      to: '0x0000000000000000000000000000000000000000',
      account: {
        address: '0x0000000000000000000000000000000000000000',
        type: 'local',
        source: 'unknown-source',
      },
    } as never)
    expect((rpc as Record<string, unknown>).keyType).toBeUndefined()
  })

  test('behavior: action without calls uses to/value/data', () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        to: '0x0000000000000000000000000000000000000001',
        value: 100n,
        data: '0xdeadbeef',
        feeToken: 1n,
      } as never,
      'sendTransaction',
    )
    expect(rpc.calls).toBeDefined()
    expect(rpc.calls?.[0]?.to).toBe(
      '0x0000000000000000000000000000000000000001',
    )
    expect(rpc.calls?.[0]?.value).toBe('0x64')
    expect(rpc.calls?.[0]?.data).toBe('0xdeadbeef')
  })

  test('behavior: action without `to` and `data` uses zero address', () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        feeToken: 1n,
      } as never,
      'sendTransaction',
    )
    expect(rpc.calls?.[0]?.to).toBe(
      '0x0000000000000000000000000000000000000000',
    )
  })

  test('behavior: action without `to`', () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        data: '0xdeadbeef',
        feeToken: 1n,
      } as never,
      'sendTransaction',
    )
    expect(rpc.calls?.[0]?.to).toBe(undefined)
  })

  test('behavior: feePayer: true deletes feeToken', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: true,
      feeToken: '0x20c0000000000000000000000000000000000001',
    } as never)
    expect((rpc as Record<string, unknown>).feeToken).toBeUndefined()
    expect((rpc as Record<string, unknown>).feePayer).toBe(true)
  })

  test('behavior: feePayer as object is parsed', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: { address: '0x0000000000000000000000000000000000000001' },
    } as never)
    expect((rpc as Record<string, unknown>).feePayer).toBeDefined()
  })
})
