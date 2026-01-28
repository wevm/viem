import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { getTransaction, sendTransactionSync } from '../../actions/index.js'
import * as Concurrent from './concurrent.js'
import { maxUint256 } from '../../constants/number.js'

const client = getClient({
  account: accounts.at(0)!,
})

describe('detect', () => {
  test('single request returns false', async () => {
    const result = await Concurrent.detect('0xsingle')
    expect(result).toBe(false)
  })

  test('concurrent requests return true', async () => {
    const results = await Promise.all([
      Concurrent.detect('0xconcurrent'),
      Concurrent.detect('0xconcurrent'),
    ])
    expect(results[0]).toBe(true)
    expect(results[1]).toBe(true)
  })

  test('3+ concurrent requests all return true', async () => {
    const results = await Promise.all([
      Concurrent.detect('0xtriple'),
      Concurrent.detect('0xtriple'),
      Concurrent.detect('0xtriple'),
    ])
    expect(results[0]).toBe(true)
    expect(results[1]).toBe(true)
    expect(results[2]).toBe(true)
  })
})

describe('integration', () => {
  test('sendTransaction with expiring nonce', async () => {
    const receipt = await sendTransactionSync(client, {
      to: '0x0000000000000000000000000000000000000000',
      nonceKey: 'expiring',
    })

    expect(receipt.status).toBe('success')
  })

  test('concurrent transactions use expiring nonces', async () => {
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

    const transactions = await Promise.all(
      receipts.map((r) => getTransaction(client, { hash: r.transactionHash })),
    )

    expect(transactions[0].nonceKey).toBe(maxUint256)
    expect(transactions[1].nonceKey).toBe(maxUint256)
    expect(transactions[2].nonceKey).toBe(maxUint256)
  })
})
