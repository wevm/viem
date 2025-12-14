import * as Http from 'node:http'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Hex, RpcRequest, RpcResponse } from 'ox'
import { privateKeyToAccount } from 'viem/accounts'
import {
  getCallsStatus,
  sendCallsSync,
  sendTransaction,
  sendTransactionSync,
  signTransaction,
} from 'viem/actions'
import { Transaction } from 'viem/tempo'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { accounts, chain, getClient, http } from '~test/tempo/config.js'
import { walletNamespaceCompat, withFeePayer } from './Transport.js'

describe('withFeePayer', () => {
  let server: Http.Server
  let feePayerRequests: string[] = []

  beforeAll(async () => {
    server = Http.createServer(
      createRequestListener(async (r) => {
        const feePayerClient = getClient({
          account: accounts[0],
        })

        const request = RpcRequest.from(await r.json())

        feePayerRequests.push(request.method)

        if (
          (request as any).method !== 'eth_signRawTransaction' &&
          request.method !== 'eth_sendRawTransaction' &&
          request.method !== 'eth_sendRawTransactionSync'
        )
          return Response.json(
            RpcResponse.from(
              {
                error: new RpcResponse.InvalidParamsError({
                  message: 'unsupported method',
                }),
              },
              { request },
            ),
          )

        const serialized = request.params?.[0] as `0x76${string}`

        const transaction = Transaction.deserialize(serialized)
        const serializedTransaction = await signTransaction(feePayerClient, {
          ...transaction,
          feePayer: feePayerClient.account,
        })

        if ((request as any).method === 'eth_signRawTransaction') {
          return Response.json(
            RpcResponse.from({ result: serializedTransaction }, { request }),
          )
        }

        const result = await feePayerClient.request({
          method: request.method,
          params: [serializedTransaction],
        } as never)

        return Response.json(RpcResponse.from({ result }, { request }))
      }),
    ).listen(3051)
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    feePayerRequests = []
  })

  describe('policy: sign-only (default)', () => {
    const client = getClient({
      transport: withFeePayer(http(), http('http://localhost:3051')),
    })

    test('behavior: sendTransaction with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
      expect(feePayerRequests).toHaveLength(1)
      expect(feePayerRequests).toContain('eth_signRawTransaction')
    })

    test('behavior: sendTransactionSync with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(feePayerRequests).toHaveLength(1)
      expect(feePayerRequests).toContain('eth_signRawTransaction')
    })

    test('behavior: non-sponsored transaction uses default transport', async () => {
      const receipt = await sendTransactionSync(client, {
        account: accounts[0],
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(feePayerRequests).toHaveLength(0)
    })
  })

  describe('policy: sign-and-broadcast', () => {
    const client = getClient({
      transport: withFeePayer(http(), http('http://localhost:3051'), {
        policy: 'sign-and-broadcast',
      }),
    })

    test('behavior: sendTransaction with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      await sendTransaction(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(feePayerRequests).toHaveLength(1)
      expect(feePayerRequests).toContain('eth_sendRawTransaction')
    })

    test('behavior: sendTransactionSync with feePayer: true', async () => {
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: true,
        to: '0x0000000000000000000000000000000000000000',
      })

      expect(receipt.status).toBe('success')
      expect(feePayerRequests).toHaveLength(1)
      expect(feePayerRequests).toContain('eth_sendRawTransactionSync')
    })
  })
})

describe('walletNamespaceCompat', () => {
  const client = getClient({
    transport: walletNamespaceCompat(http(), {
      account: accounts[0],
    }),
  })

  describe('wallet_sendCalls', () => {
    test('default', async () => {
      const result = await sendCallsSync(client, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      })

      expect(result.id).toBeDefined()
      expect(result.id.startsWith('0x')).toBe(true)
    })

    test('with sync capability', async () => {
      const result = await sendCallsSync(client, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        capabilities: { sync: true },
      })

      expect(result.id).toBeDefined()
    })

    test('with value', async () => {
      const result = await sendCallsSync(client, {
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: 0n,
          },
        ],
      })

      expect(result.id).toBeDefined()
    })

    test('error: no chainId', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [{ atomicRequired: false, calls: [], version: '2.0.0' }],
        }),
      ).rejects.toThrow()
    })

    test('error: wrong chainId', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [
            {
              atomicRequired: false,
              chainId: '0x999',
              calls: [],
              version: '2.0.0',
            },
          ],
        }),
      ).rejects.toThrow()
    })

    test('error: from address mismatch', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [
            {
              atomicRequired: false,
              chainId: Hex.fromNumber(chain.id),
              from: '0x0000000000000000000000000000000000000001',
              calls: [],
              version: '2.0.0',
            },
          ],
        }),
      ).rejects.toThrow()
    })

    test('error: with empty params', async () => {
      await expect(
        client.request({
          method: 'wallet_sendCalls',
          params: [],
        } as never),
      ).rejects.toThrow()
    })

    test('error: with data', async () => {
      const result = await sendCallsSync(client, {
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            data: '0xdeadbeef',
          },
        ],
      })

      expect(result.id).toBeDefined()
    })
  })

  describe('wallet_getCallsStatus', () => {
    test('default', async () => {
      const { id } = await sendCallsSync(client, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        capabilities: { sync: true },
      })

      const status = await getCallsStatus(client, { id })

      expect(status.status).toBeDefined()
      expect(status.atomic).toBe(true)
      expect(status.receipts).toBeDefined()
      expect(status.receipts?.length).toBe(1)
    })

    test('error: no id', async () => {
      await expect(
        client.request({
          method: 'wallet_getCallsStatus',
          params: [],
        } as never),
      ).rejects.toThrow('`id` not found')
    })

    test('error: unsupported id format', async () => {
      await expect(
        client.request({
          method: 'wallet_getCallsStatus',
          params: ['0x1234'],
        }),
      ).rejects.toThrow('`id` not supported')
    })

    test('error: no params', async () => {
      await expect(
        client.request({
          method: 'wallet_getCallsStatus',
        } as never),
      ).rejects.toThrow('`id` not found')
    })
  })

  test('passthrough for other methods', async () => {
    const blockNumber = await client.request({
      method: 'eth_blockNumber',
    })
    expect(blockNumber).toBeDefined()
  })
})
