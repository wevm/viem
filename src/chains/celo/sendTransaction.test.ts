import { describe, expect, test, vi } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import {
  type EIP1193RequestFn,
  type PublicRpcSchema,
  type WalletRpcSchema,
  createTransport,
  createWalletClient,
} from '../../index.js'
import { celo } from '../index.js'

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
      return 1n
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

  test('provides valid transaction params to sign for eth_sendRawTransaction (local account) for CIP-42', async () => {
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
        '0x7cf89282a4ec8001850165a0bc0101940000000000000000000000000000000000000fee9400000000000000000000000000000000000000017b94f39fd6e51aad88f6f4ce6ab8827279cfffb922660180c080a004389976320970e0227b20df6f79f2f35a2832d18b9732cb017d15db9f80fb44a0735b9abf965b7f38d1c659527cc93a9fc37b3a3b7bd5910d0c7db4b740be860f',
      ],
    })
  })
})
