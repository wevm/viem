import { describe, expect, test, vi } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import { celo } from '../chains/index.js'
import {
  type EIP1193RequestFn,
  type PublicRpcSchema,
  type WalletRpcSchema,
  createTransport,
  createWalletClient,
} from '../index.js'

describe('sendTransaction()', () => {
  // We need a local account
  const account = privateKeyToAccount(accounts[0].privateKey)
  const toAddress = account.address
  const transactionHash = '0xtransaction-hash'
  const feeCurrencyAddress = '0x0000000000000000000000000000000000000fee'
  const transportRequestMock = vi.fn(async (request) => {
    if (request.method === 'eth_chainId') {
      return celo.id
    }

    if (request.method === 'eth_getBlockByNumber') {
      // We just need baseFeePerGas for gas estimation
      return {
        baseFeePerGas: '0x12a05f200',
      }
    }

    if (request.method === 'eth_maxPriorityFeePerGas') {
      return 602286n
    }

    if (
      request.method === 'eth_gasPrice' &&
      (request.params as string[])[0] === feeCurrencyAddress
    ) {
      return 15057755162n
    }

    if (request.method === 'eth_estimateGas') {
      return 1n
    }

    if (request.method === 'eth_getTransactionCount') {
      return 0
    }

    if (request.method === 'eth_sendRawTransaction') {
      return transactionHash
    }

    return null
  }) as EIP1193RequestFn<WalletRpcSchema & PublicRpcSchema>

  const mockTransport = () =>
    createTransport({
      key: 'mock',
      name: 'Mock Transport',
      request: transportRequestMock,
      type: 'mock',
    })

  const client = createWalletClient({
    transport: mockTransport,
    chain: celo,
    account,
  })

  test('provides valid transaction params to sign for eth_sendRawTransaction (local account) for CIP-64', async () => {
    const hash = await client.sendTransaction({
      value: 1n,
      to: toAddress,
      feeCurrency: feeCurrencyAddress,
      maxFeePerGas: 123n,
      maxPriorityFeePerGas: 123n,
    })

    expect(hash).toEqual(transactionHash)
  })

  test('provides valid transaction params to sign for eth_sendRawTransaction (local account) for CIP-42 - sending as CIP-64', async () => {
    const hash = await client.sendTransaction({
      value: 1n,
      to: toAddress,
      feeCurrency: feeCurrencyAddress,
      gatewayFee: 123n,
      gatewayFeeRecipient: '0x0000000000000000000000000000000000000001',
    })

    expect(hash).toEqual(transactionHash)
  })
})
