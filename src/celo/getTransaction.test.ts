import { describe, expect, test, vi } from 'vitest'
import { celo } from '../chains/index.js'
import {
  type EIP1193RequestFn,
  type PublicRpcSchema,
  type WalletRpcSchema,
  createPublicClient,
  createTransport,
} from '../index.js'

describe('getTransaction()', () => {
  const transportRequestMock = vi.fn(async (request) => {
    if (request.method === 'eth_getTransactionByHash') {
      return {
        hash: '0xb733188a557d376b29bd8fd7bbd9cbefea6beaa90b993bd967c3eab9826b1e59',
        nonce: '0x23cb',
        blockHash:
          '0x81d734d38a2c62726a0ce029e3f0291c7c54cac35db7b1f60e558133c6f44d18',
        blockNumber: '0xefa8eb',
        transactionIndex: '0x2',
        from: '0xeb350f3c0d8519ff63540c6f26950935f5b93efa',
        to: '0x4aad04d41fd7fd495503731c5a2579e19054c432',
        value: '0x0',
        gas: '0x1d3c9',
        maxFeePerGas: '0x83215600',
        maxPriorityFeePerGas: '0x77359400',
        input:
          '0xa020c8de0000000000000000000000007550d8d538bc883c965dfac89a8c76de4a2672e3000000000000000000000000c8a81d473992c7c6d3f469a8263f24914625709d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005',
        r: '0x198e15feb6f615c3ae9ba42e1721b518d391aa6b098005b03c6c4051f694bf0c',
        s: '0x584546ab557daf99b3118f3efb0583d57cc9d3136bce0d436d0acc821eddddf1',
        v: '0x1',
        chainId: '0xa4ec',
        accessList: [],
        type: '0x7c',
        ethCompatible: false,
        feeCurrency: null,
        gatewayFee: '0x0',
        gatewayFeeRecipient: '0x7a41b0e608a6bcf8c8ad78671e175d6df7f71f95',
        gasPrice: null,
      }
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

  const client = createPublicClient({
    transport: mockTransport,
    chain: celo,
  })

  test('returns CIP-42 transaction', async () => {
    expect(
      await client.getTransaction({
        hash: '0xb733188a557d376b29bd8fd7bbd9cbefea6beaa90b993bd967c3eab9826b1e59',
      }),
    ).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0x81d734d38a2c62726a0ce029e3f0291c7c54cac35db7b1f60e558133c6f44d18",
        "blockNumber": 15706347n,
        "chainId": 42220,
        "ethCompatible": false,
        "feeCurrency": null,
        "from": "0xeb350f3c0d8519ff63540c6f26950935f5b93efa",
        "gas": 119753n,
        "gasPrice": undefined,
        "gatewayFee": 0n,
        "gatewayFeeRecipient": "0x7a41b0e608a6bcf8c8ad78671e175d6df7f71f95",
        "hash": "0xb733188a557d376b29bd8fd7bbd9cbefea6beaa90b993bd967c3eab9826b1e59",
        "input": "0xa020c8de0000000000000000000000007550d8d538bc883c965dfac89a8c76de4a2672e3000000000000000000000000c8a81d473992c7c6d3f469a8263f24914625709d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005",
        "maxFeePerBlobGas": undefined,
        "maxFeePerGas": 2200000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 9163,
        "r": "0x198e15feb6f615c3ae9ba42e1721b518d391aa6b098005b03c6c4051f694bf0c",
        "s": "0x584546ab557daf99b3118f3efb0583d57cc9d3136bce0d436d0acc821eddddf1",
        "to": "0x4aad04d41fd7fd495503731c5a2579e19054c432",
        "transactionIndex": 2,
        "type": "cip42",
        "typeHex": "0x7c",
        "v": 1n,
        "value": 0n,
        "yParity": 1,
      }
    `)
  })
})
