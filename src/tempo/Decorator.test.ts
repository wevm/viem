import { createClient, http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

describe('decorator', () => {
  const client2 = createClient({
    chain: tempoLocalnet,
    transport: http(),
  }).extend(tempoActions())

  test('default', async () => {
    expect(Object.keys(client2)).toMatchInlineSnapshot(`
      [
        "account",
        "batch",
        "cacheTime",
        "ccipRead",
        "chain",
        "dataSuffix",
        "key",
        "name",
        "pollingInterval",
        "request",
        "tokens",
        "transport",
        "type",
        "uid",
        "extend",
        "accessKey",
        "amm",
        "channel",
        "dex",
        "earn",
        "faucet",
        "nonce",
        "fee",
        "policy",
        "receivePolicy",
        "reward",
        "simulate",
        "token",
        "validator",
        "virtualAddress",
        "zone",
      ]
    `)
  })

  test('binds action helpers', () => {
    expect(typeof client2.dex.buy.call).toBe('function')
    expect(typeof client2.amm.getPool.calls).toBe('function')
    expect(typeof client2.accessKey.getRemainingLimit.callWithPeriod).toBe(
      'function',
    )
    expect(typeof client2.token.transfer.call).toBe('function')
    expect(typeof client2.token.transfer.estimateGas).toBe('function')
    expect(typeof client2.token.transfer.simulate).toBe('function')
    expect(typeof client2.zone.encryptedDeposit.prepare).toBe('function')
    expect(typeof client2.zone.encryptedDeposit.prepareRecipient).toBe(
      'function',
    )
    expect(typeof client2.zone.requestWithdrawal.prepare).toBe('function')
    expect(typeof client2.zone.getEncryptionKey.calls).toBe('function')
    expect(typeof client2.earn.privateDeposit.prepare).toBe('function')
    expect(typeof client2.earn.privateDeposit.calls).toBe('function')
    expect(typeof client2.earn.privateRedeem.prepare).toBe('function')
    expect(typeof client2.earn.privateRedeem.calls).toBe('function')
  })

  test('binds missing action entries', () => {
    expect(typeof client2.dex.getOrderbook).toBe('function')
    expect(typeof client2.fee.getValidatorToken).toBe('function')
    expect(typeof client2.reward.getPendingRewards).toBe('function')
    expect(typeof client2.token.prepareUpdateQuoteToken).toBe('function')
    expect(typeof client2.token.watchUpdateQuoteToken).toBe('function')
    expect(typeof client2.accessKey.verifyHash).toBe('function')
    expect(typeof client2.zone.getEncryptionKey).toBe('function')
    expect(typeof client2.zone.waitForDepositStatus).toBe('function')
    expect(typeof client2.earn.waitForPrivateDeposit).toBe('function')
    expect(typeof client2.earn.waitForPrivateRedeem).toBe('function')
  })

  test('binds pure and client-first call helpers', () => {
    const token = '0x20c0000000000000000000000000000000000001'

    expect(
      client2.dex.buy.call({
        amountOut: 1n,
        maxAmountIn: 1n,
        tokenIn: token,
        tokenOut: token,
      }).to,
    ).toBe('0xdec0000000000000000000000000000000000000')

    expect(
      client2.token.transfer.call({
        amount: 1n,
        to: '0x0000000000000000000000000000000000000000',
        token,
      }).to,
    ).toBe(token)
  })
})
