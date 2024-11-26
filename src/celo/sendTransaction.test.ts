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
    expect(transportRequestMock).toHaveBeenLastCalledWith({
      method: 'eth_sendRawTransaction',
      params: [
        '0x7bf87782a4ec807b7b0194f39fd6e51aad88f6f4ce6ab8827279cfffb922660180c0940000000000000000000000000000000000000fee01a038c5dfc128d40b147544b13572dbb0462b9389a8a687d0fe32973e435d7de23aa03c01d6bff1279e94f53a1244302de288bd335bc3a1e61da73fd6215f6d67ccf2',
      ],
    })
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
    expect(transportRequestMock).toHaveBeenLastCalledWith({
      method: 'eth_sendRawTransaction',
      params: [
        '0x7bf87f82a4ec80830930ae8504350cec000194f39fd6e51aad88f6f4ce6ab8827279cfffb922660180c0940000000000000000000000000000000000000fee80a0b61a83b7fe73e24f223f563447cdb69f6dedc7f7f7b2acc4e41f2e57143ccd57a03ce0bcc81c026ff0eb17274940748e23250fe988f71370eba1e59e43557835b3',
      ],
    })
  })
})
