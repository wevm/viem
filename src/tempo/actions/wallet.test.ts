import { parseAbi } from 'abitype'
import * as Address from 'ox/Address'
import * as P256 from 'ox/P256'
import * as PublicKey from 'ox/PublicKey'
import { KeyAuthorization } from 'ox/tempo'
import { expect, test, vi } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { connect } from '../../actions/wallet/connect.js'
import * as coreSendTransactionSync from '../../actions/wallet/sendTransactionSync.js'
import { tempoLocalnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { custom } from '../../clients/transports/custom.js'
import { UnsupportedProviderMethodError } from '../../errors/rpc.js'
import type { WalletGetCallsStatusReturnType } from '../../types/eip1193.js'
import type { RpcTransactionReceipt } from '../../types/rpc.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import type { TransactionReceipt } from '../Transaction.js'
import * as wallet from './wallet.js'

const account = '0x0000000000000000000000000000000000000001'
const accessKey = '0x0000000000000000000000000000000000000002'
const recipient = '0x0000000000000000000000000000000000000003'
const feeToken = '0x20c0000000000000000000000000000000000001'
const privateKey_p256 =
  '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28'
const publicKey_p256 = P256.getPublicKey({ privateKey: privateKey_p256 })
const publicKey_p256_hex = PublicKey.toHex(publicKey_p256, {
  includePrefix: false,
})
const publicKey_p256_address = Address.fromPublicKey(publicKey_p256)

const receipt = {
  blockHash:
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  blockNumber: 1n,
  contractAddress: null,
  cumulativeGasUsed: 1n,
  effectiveGasPrice: 1n,
  from: '0x0000000000000000000000000000000000000001',
  gasUsed: 1n,
  logs: [],
  logsBloom: '0x0',
  status: 'success',
  to: null,
  transactionHash:
    '0x0000000000000000000000000000000000000000000000000000000000000002',
  transactionIndex: 0,
  type: 'tempo',
} satisfies TransactionReceipt

const rpcReceipt = (
  overrides: Partial<RpcTransactionReceipt> = {},
): RpcTransactionReceipt =>
  ({
    blockHash:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    blockNumber: '0x1',
    contractAddress: null,
    cumulativeGasUsed: '0x1',
    effectiveGasPrice: '0x1',
    from: account,
    gasUsed: '0x1',
    logs: [],
    logsBloom: '0x0',
    status: '0x1',
    to: null,
    transactionHash:
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    transactionIndex: '0x0',
    type: '0x76',
    ...overrides,
  }) as RpcTransactionReceipt

const keyAuthorizationRpc = {
  chainId: numberToHex(tempoLocalnet.id),
  expiry: numberToHex(123),
  keyId: accessKey,
  keyType: 'secp256k1',
  limits: [{ token: feeToken, limit: '0x7b', period: '0x3c' }],
  signature: {
    type: 'secp256k1',
    r: '0x635dc2033e60185bb36709c29c75d64ea51dfbd91c32ef4be198e4ceb169fb4d',
    s: '0x50c2667ac4c771072746acfdcf1f1483336dcca8bd2df47cd83175dbe60f0540',
    yParity: '0x0',
  },
} satisfies KeyAuthorization.Rpc

const keyAuthorization = KeyAuthorization.fromRpc(keyAuthorizationRpc)

const client = (
  requests: unknown[],
  handlers: Record<string, (request: any) => unknown> = {},
  chain: typeof tempoLocalnet | null = tempoLocalnet,
) =>
  createClient({
    account,
    ...(chain ? { chain } : {}),
    transport: custom({
      async request(request) {
        requests.push(request)

        if (request.method in handlers) return handlers[request.method](request)

        if (request.method === 'eth_chainId')
          return numberToHex(tempoLocalnet.id)
        if (request.method === 'eth_sendTransactionSync')
          return rpcReceipt() as never
        if (request.method === 'wallet_sendCallsSync')
          return {
            atomic: false,
            chainId: numberToHex(tempoLocalnet.id),
            id: '0x1',
            receipts: [
              {
                blockHash:
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                blockNumber: '0x1',
                gasUsed: '0x1',
                logs: [],
                status: '0x1',
                transactionHash:
                  '0x0000000000000000000000000000000000000000000000000000000000000002',
              },
            ],
            status: 200,
            version: '2.0.0',
          } satisfies WalletGetCallsStatusReturnType
        if (request.method === 'wallet_authorizeAccessKey')
          return {
            keyAuthorization: keyAuthorizationRpc,
            rootAddress: account,
          }
        if (request.method === 'wallet_connect')
          return {
            accounts: [
              {
                address: account,
                capabilities: {
                  auth: { token: 'token' },
                  email: null,
                  keyAuthorization: keyAuthorizationRpc,
                  personalSign: { message: 'hello' },
                  signature: '0x1234',
                  username: 'tony',
                },
              },
            ],
          }
        if (request.method === 'wallet_revokeAccessKey') return undefined
        if (request.method === 'wallet_transfer')
          return { chainId: 4321, receipt }
        if (request.method === 'wallet_swap') return { receipt }
        if (request.method === 'wallet_deposit')
          return { receipts: [receipt] } as never

        return null
      },
    }),
  })

test('connect sends wallet_connect and formats capabilities', async () => {
  const requests: any[] = []
  const result = await connect(client(requests, {}, null), {
    chain: tempoLocalnet,
    capabilities: {
      authorizeAccessKey: {
        accessKey: { address: accessKey, type: 'secp256k1' },
        expiry: 123,
        limits: [{ token: feeToken, limit: 123n, period: 60 }],
        scopes: [
          {
            address: recipient,
            selector: 'transfer(address,uint256)',
            recipients: [accessKey],
          },
        ],
      },
      auth: { returnToken: true, url: '/api/auth' },
      method: 'register',
      name: 'default',
      personalSign: { message: 'hello' },
      showDeposit: { amount: '50', on: 'register', token: 'USDC' },
      userId: 'user',
    },
  })

  expect(requests.map(({ method }) => method)).toEqual(['wallet_connect'])
  expect(requests[0].params[0]).toEqual({
    capabilities: {
      authorizeAccessKey: {
        address: accessKey,
        chainId: numberToHex(tempoLocalnet.id),
        expiry: 123,
        keyType: 'secp256k1',
        limits: [{ limit: '0x7b', period: 60, token: feeToken }],
        scopes: [
          {
            address: recipient,
            recipients: [accessKey],
            selector: '0xa9059cbb',
          },
        ],
      },
      auth: { returnToken: true, url: '/api/auth' },
      method: 'register',
      name: 'default',
      personalSign: { message: 'hello' },
      showDeposit: { amount: '50', on: 'register', token: 'USDC' },
      userId: 'user',
    },
    chainId: numberToHex(tempoLocalnet.id),
    version: '1',
  })
  expect(result).toEqual({
    accounts: [
      {
        address: account,
        capabilities: {
          auth: { token: 'token' },
          email: null,
          keyAuthorization,
          personalSign: { message: 'hello' },
          signature: '0x1234',
          username: 'tony',
        },
      },
    ],
  })
})

test('connect defaults chainId from client chain', async () => {
  const requests: any[] = []
  await connect(client(requests), {
    capabilities: {
      authorizeAccessKey: {
        expiry: 123,
        keyType: 'p256',
      },
      method: 'login',
    },
  })

  expect(requests.map(({ method }) => method)).toEqual(['wallet_connect'])
  expect(requests[0].params[0]).toEqual({
    capabilities: {
      authorizeAccessKey: {
        chainId: numberToHex(tempoLocalnet.id),
        expiry: 123,
        keyType: 'p256',
      },
      method: 'login',
    },
    chainId: numberToHex(tempoLocalnet.id),
    version: '1',
  })
})

test('connect normalizes accounts without capabilities', async () => {
  const requests: any[] = []
  const result = await connect(
    client(requests, {
      wallet_connect: () => ({ accounts: [{ address: account }] }),
    }),
  )

  expect(requests.map(({ method }) => method)).toEqual(['wallet_connect'])
  expect(result.accounts).toEqual([{ address: account, capabilities: {} }])
})

test('connect does not fallback to eth_requestAccounts', async () => {
  const requests: any[] = []
  await expect(
    connect(
      client(requests, {
        wallet_connect: () => {
          throw new UnsupportedProviderMethodError(new Error())
        },
        eth_requestAccounts: () => [account],
      }),
    ),
  ).rejects.toThrow(UnsupportedProviderMethodError)

  expect(requests.map(({ method }) => method)).toEqual(['wallet_connect'])
})

test('sendTransactionSync sends eth_sendTransactionSync and formats Tempo fields', async () => {
  const requests: any[] = []
  const result = await wallet.sendTransactionSync(client(requests), {
    account,
    data: '0xabcd',
    dataSuffix: '0x1234',
    feeToken,
    to: recipient,
    type: 'tempo',
    value: 1n,
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'eth_chainId',
    'eth_sendTransactionSync',
  ])
  expect(requests[1].params[0]).toMatchObject({
    calls: [{ data: '0xabcd1234', to: recipient, value: '0x1' }],
    chainId: numberToHex(tempoLocalnet.id),
    feeToken,
    from: account,
    type: '0x76',
  })
  expect(result.blockNumber).toBe(1n)
  expect(result.status).toBe('success')
})

test('sendTransactionSync uses action-level chain formatter', async () => {
  const requests: any[] = []
  await wallet.sendTransactionSync(client(requests, {}, null), {
    account,
    chain: tempoLocalnet,
    feeToken,
    to: recipient,
    type: 'tempo',
    value: 1n,
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'eth_chainId',
    'eth_sendTransactionSync',
  ])
  expect(requests[1].params[0]).toMatchObject({
    calls: [{ to: recipient, value: '0x1' }],
    chainId: numberToHex(tempoLocalnet.id),
    feeToken,
    from: account,
    type: '0x76',
  })
})

test('sendTransactionSync preserves explicit null account', async () => {
  const requests: any[] = []
  await wallet.sendTransactionSync(client(requests), {
    account: null,
    to: recipient,
    type: 'tempo',
    value: 1n,
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'eth_chainId',
    'eth_sendTransactionSync',
  ])
  expect(requests[1].params[0]).toMatchObject({
    calls: [{ to: recipient, value: '0x1' }],
    chainId: numberToHex(tempoLocalnet.id),
    type: '0x76',
  })
  expect(requests[1].params[0]).not.toHaveProperty('from')
})

test('sendTransactionSync falls back to hoisted account for undefined account', async () => {
  const requests: any[] = []
  await wallet.sendTransactionSync(client(requests), {
    account: undefined,
    to: recipient,
    type: 'tempo',
    value: 1n,
  })

  expect(requests[1].params[0]).toMatchObject({
    from: account,
  })
})

test('sendTransactionSync passes timeout to eth_sendTransactionSync', async () => {
  const requests: any[] = []
  await wallet.sendTransactionSync(client(requests), {
    account,
    timeout: 0,
    to: recipient,
    type: 'tempo',
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'eth_chainId',
    'eth_sendTransactionSync',
  ])
  expect(requests[1].params).toHaveLength(2)
  expect(requests[1].params[1]).toBe(0)
})

test('sendTransactionSync throws on reverted receipt by default', async () => {
  const requests: any[] = []
  await expect(
    wallet.sendTransactionSync(
      client(requests, {
        eth_sendTransactionSync: () => rpcReceipt({ status: '0x0' }),
      }),
      {
        account,
        to: recipient,
        type: 'tempo',
      },
    ),
  ).rejects.toThrow('reverted')
})

test('sendTransactionSync delegates local accounts to core raw sync path', async () => {
  const spy = vi
    .spyOn(coreSendTransactionSync, 'sendTransactionSync')
    .mockResolvedValue(receipt as never)
  const localAccount = privateKeyToAccount(
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  )
  const requests: unknown[] = []

  const result = await wallet.sendTransactionSync(client(requests), {
    account: localAccount,
    to: recipient,
    value: 1n,
  })

  expect(result).toBe(receipt)
  expect(spy).toHaveBeenCalledOnce()
  expect(requests).toEqual([])
  spy.mockRestore()
})

test('writeContractSync routes through Tempo sendTransactionSync', async () => {
  const requests: any[] = []
  await wallet.writeContractSync(client(requests), {
    account,
    address: recipient,
    abi: parseAbi(['function mint(uint256 tokenId)']),
    args: [1n],
    functionName: 'mint',
    type: 'tempo',
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'eth_chainId',
    'eth_sendTransactionSync',
  ])
  expect(requests[1].params[0].calls[0]).toMatchObject({
    to: recipient,
  })
  expect(requests[1].params[0].calls[0].data).toMatch(/^0xa0712d68/)
})

test('writeContractSync routes through Tempo sendTransactionSync on wallet clients', async () => {
  const requests: any[] = []
  const walletClient = createWalletClient({
    account,
    chain: tempoLocalnet,
    transport: custom({
      async request(request) {
        requests.push(request)
        if (request.method === 'eth_chainId')
          return numberToHex(tempoLocalnet.id)
        if (request.method === 'eth_sendTransactionSync')
          return rpcReceipt() as never
        if (request.method === 'eth_sendTransaction')
          throw new Error('Unexpected core sendTransactionSync path.')
        return null
      },
    }),
  })

  await wallet.writeContractSync(walletClient, {
    account,
    address: recipient,
    abi: parseAbi(['function mint(uint256 tokenId)']),
    args: [1n],
    functionName: 'mint',
    type: 'tempo',
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'eth_chainId',
    'eth_sendTransactionSync',
  ])
})

test('sendCallsSync sends wallet_sendCallsSync and formats status', async () => {
  const requests: any[] = []
  const result = await wallet.sendCallsSync(client(requests), {
    account,
    calls: [{ data: '0x1234', to: recipient, value: 1n }],
    throwOnFailure: true,
  })

  expect(requests.map(({ method }) => method)).toEqual(['wallet_sendCallsSync'])
  expect(requests[0].params[0].calls).toEqual([
    { data: '0x1234', to: recipient, value: '0x1' },
  ])
  expect(result.status).toBe('success')
  expect(result.receipts![0].blockNumber).toBe(1n)
  expect(result.receipts![0].status).toBe('success')
})

test('sendCallsSync passes timeout to wallet_sendCallsSync', async () => {
  const requests: any[] = []
  await wallet.sendCallsSync(client(requests), {
    account,
    calls: [{ to: recipient }],
    timeout: 1234,
  })

  expect(requests.map(({ method }) => method)).toEqual(['wallet_sendCallsSync'])
  expect(requests[0].params).toEqual([
    expect.objectContaining({
      calls: [{ to: recipient, value: undefined, data: undefined }],
    }),
    1234,
  ])
})

test('authorizeAccessKey sends wallet_authorizeAccessKey and returns authorization', async () => {
  const requests: any[] = []
  const result = await wallet.authorizeAccessKey(client(requests), {
    accessKey: { address: accessKey, type: 'secp256k1' },
    expiry: 123,
    limits: [{ token: feeToken, limit: 123n, period: 60 }],
    scopes: [
      {
        address: recipient,
        selector: 'transfer(address,uint256)',
        recipients: [accessKey],
      },
    ],
    showDeposit: { amount: '50', token: 'USDC' },
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'wallet_authorizeAccessKey',
  ])
  expect(requests[0].params[0]).toEqual({
    address: accessKey,
    chainId: numberToHex(tempoLocalnet.id),
    expiry: 123,
    keyType: 'secp256k1',
    limits: [{ limit: '0x7b', period: 60, token: feeToken }],
    scopes: [
      {
        address: recipient,
        recipients: [accessKey],
        selector: '0xa9059cbb',
      },
    ],
    showDeposit: { amount: '50', token: 'USDC' },
  })
  expect(result).toEqual({
    keyAuthorization,
    rootAddress: account,
  })
})

test('authorizeAccessKey omits chainId without a client chain', async () => {
  const requests: any[] = []
  await wallet.authorizeAccessKey(client(requests, {}, null), {
    accessKey: { address: accessKey, type: 'secp256k1' },
    expiry: 123,
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'wallet_authorizeAccessKey',
  ])
  expect(requests[0].params[0]).toEqual({
    address: accessKey,
    expiry: 123,
    keyType: 'secp256k1',
  })
})

test('authorizeAccessKey normalizes public key access keys', async () => {
  const requests: any[] = []
  await wallet.authorizeAccessKey(client(requests), {
    accessKey: {
      publicKey: publicKey_p256_hex,
      type: 'p256',
    },
    expiry: 123,
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'wallet_authorizeAccessKey',
  ])
  expect(requests[0].params[0]).toEqual({
    address: publicKey_p256_address,
    chainId: numberToHex(tempoLocalnet.id),
    expiry: 123,
    keyType: 'p256',
  })
})

test('authorizeAccessKey supports wallet-generated access keys', async () => {
  const requests: any[] = []
  await wallet.authorizeAccessKey(client(requests), {
    expiry: 123,
    keyType: 'p256',
    scopes: [
      {
        address: recipient,
        selector: 'transfer(address,uint256)',
        recipients: [accessKey],
      },
    ],
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'wallet_authorizeAccessKey',
  ])
  expect(requests[0].params[0]).toEqual({
    chainId: numberToHex(tempoLocalnet.id),
    expiry: 123,
    keyType: 'p256',
    scopes: [
      {
        address: recipient,
        recipients: [accessKey],
        selector: '0xa9059cbb',
      },
    ],
  })
})

test('revokeAccessKey sends wallet_revokeAccessKey and returns undefined', async () => {
  const requests: any[] = []
  const result = await wallet.revokeAccessKey(client(requests), {
    accessKey,
  })

  expect(requests.map(({ method }) => method)).toEqual([
    'wallet_revokeAccessKey',
  ])
  expect(requests[0].params[0]).toEqual({
    accessKeyAddress: accessKey,
    address: account,
  })
  expect(result).toBeUndefined()
})

test('revokeAccessKey normalizes object access keys', async () => {
  const requests: any[] = []
  await wallet.revokeAccessKey(client(requests), {
    accessKey: { address: accessKey, type: 'p256' },
  })

  expect(requests[0].params[0]).toEqual({
    accessKeyAddress: accessKey,
    address: account,
  })
})

test('revokeAccessKey normalizes public key access keys', async () => {
  const requests: any[] = []
  await wallet.revokeAccessKey(client(requests), {
    accessKey: {
      publicKey: publicKey_p256_hex,
      type: 'p256',
    },
  })

  expect(requests[0].params[0]).toEqual({
    accessKeyAddress: publicKey_p256_address,
    address: account,
  })
})

test('sendCallsSync requires a chain', async () => {
  const requests: any[] = []
  await expect(
    wallet.sendCallsSync(client(requests, {}, null), {
      account,
      calls: [{ to: recipient }],
    }),
  ).rejects.toThrow('No chain was provided to the request.')
  expect(requests).toEqual([])
})

test('revokeAccessKey requires an owner address', async () => {
  const requests: any[] = []
  const client_ = createClient({
    chain: tempoLocalnet,
    transport: custom({
      async request(request) {
        requests.push(request)
        return undefined
      },
    }),
  })

  await expect(
    wallet.revokeAccessKey(client_, {
      accessKey,
    }),
  ).rejects.toThrow('Could not find an Account to execute with this Action.')
  expect(requests).toEqual([])
})

test('transfer', async () => {
  const requests: unknown[] = []
  const result = await wallet.transfer(client(requests), {
    amount: '1.5',
    feePayer: false,
    memo: 'thanks',
    to: '0x0000000000000000000000000000000000000003',
    token: '0x0000000000000000000000000000000000000004',
  })

  expect({ requests, result }).toMatchInlineSnapshot(`
    {
      "requests": [
        {
          "method": "wallet_transfer",
          "params": [
            {
              "amount": "1.5",
              "feePayer": false,
              "memo": "thanks",
              "to": "0x0000000000000000000000000000000000000003",
              "token": "0x0000000000000000000000000000000000000004",
            },
          ],
        },
      ],
      "result": {
        "chainId": 4321,
        "receipt": {
          "blockHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
          "blockNumber": 1n,
          "contractAddress": null,
          "cumulativeGasUsed": 1n,
          "effectiveGasPrice": 1n,
          "from": "0x0000000000000000000000000000000000000001",
          "gasUsed": 1n,
          "logs": [],
          "logsBloom": "0x0",
          "status": "success",
          "to": null,
          "transactionHash": "0x0000000000000000000000000000000000000000000000000000000000000002",
          "transactionIndex": 0,
          "type": "tempo",
        },
      },
    }
  `)
})

test('swap', async () => {
  const requests: unknown[] = []
  const result = await wallet.swap(client(requests), {
    amount: '2.5',
    pairToken: '0x0000000000000000000000000000000000000003',
    slippage: 0.05,
    token: '0x0000000000000000000000000000000000000004',
    type: 'sell',
  })

  expect({ requests, result }).toMatchInlineSnapshot(`
    {
      "requests": [
        {
          "method": "wallet_swap",
          "params": [
            {
              "amount": "2.5",
              "pairToken": "0x0000000000000000000000000000000000000003",
              "slippage": 0.05,
              "token": "0x0000000000000000000000000000000000000004",
              "type": "sell",
            },
          ],
        },
      ],
      "result": {
        "receipt": {
          "blockHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
          "blockNumber": 1n,
          "contractAddress": null,
          "cumulativeGasUsed": 1n,
          "effectiveGasPrice": 1n,
          "from": "0x0000000000000000000000000000000000000001",
          "gasUsed": 1n,
          "logs": [],
          "logsBloom": "0x0",
          "status": "success",
          "to": null,
          "transactionHash": "0x0000000000000000000000000000000000000000000000000000000000000002",
          "transactionIndex": 0,
          "type": "tempo",
        },
      },
    }
  `)
})

test('deposit', async () => {
  const requests: unknown[] = []
  const result = await wallet.deposit(client(requests), {
    address: '0x0000000000000000000000000000000000000003',
    amount: '3.5',
    chainId: 1,
    displayName: 'Account',
    token: 'pathUsd',
  })

  expect({ requests, result }).toMatchInlineSnapshot(`
    {
      "requests": [
        {
          "method": "wallet_deposit",
          "params": [
            {
              "address": "0x0000000000000000000000000000000000000003",
              "amount": "3.5",
              "chainId": 1,
              "displayName": "Account",
              "token": "pathUsd",
            },
          ],
        },
      ],
      "result": {
        "receipts": [
          {
            "blockHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "blockNumber": 1n,
            "contractAddress": null,
            "cumulativeGasUsed": 1n,
            "effectiveGasPrice": 1n,
            "from": "0x0000000000000000000000000000000000000001",
            "gasUsed": 1n,
            "logs": [],
            "logsBloom": "0x0",
            "status": "success",
            "to": null,
            "transactionHash": "0x0000000000000000000000000000000000000000000000000000000000000002",
            "transactionIndex": 0,
            "type": "tempo",
          },
        ],
      },
    }
  `)
})
