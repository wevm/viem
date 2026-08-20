import { describe, expect, test, vi } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import {
  getTransaction,
  getTransactionReceipt,
  prepareTransactionRequest,
  sendTransactionSync,
  signTransaction,
  verifyHash,
} from '../actions/index.js'
import { mainnet, tempoLocalnet } from '../chains/index.js'
import { createClient, http } from '../index.js'
import { defineChain } from '../utils/chain/defineChain.js'
import { hashMessage } from '../utils/index.js'
import { withResolvers } from '../utils/promise/withResolvers.js'
import * as accessKeyActions from './actions/accessKey.js'
import {
  Account,
  Addresses,
  KeyAuthorizationManager,
  P256,
  WebCryptoP256,
} from './index.js'

const client = getClient({
  account: accounts.at(0)!,
})

const maxUint256 = 2n ** 256n - 1n

describe('prepareTransactionRequest', () => {
  test('behavior: expiring nonces for feePayer transactions', async () => {
    const now = Math.floor(Date.now() / 1000)
    const requests = await Promise.all([
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, { feePayer: true }),
    ])

    // All feePayer transactions use expiring nonces (nonceKey = uint256.max)
    expect(requests[0]?.nonceKey).toBe(maxUint256)
    expect(requests[1]?.nonceKey).toBe(maxUint256)
    expect(requests[2]?.nonceKey).toBe(maxUint256)

    // All should have nonce = 0 for expiring nonces
    expect(requests[0]?.nonce).toBe(0)
    expect(requests[1]?.nonce).toBe(0)
    expect(requests[2]?.nonce).toBe(0)

    // All should be immediately valid
    expect(requests[0]?.validAfter).toBeLessThan(now)
    expect(requests[1]?.validAfter).toBeLessThan(now)
    expect(requests[2]?.validAfter).toBeLessThan(now)

    // All should have validBefore set within 30 seconds
    expect(requests[0]?.validBefore).toBeGreaterThanOrEqual(now)
    expect(requests[0]?.validBefore).toBeLessThanOrEqual(now + 31)
  })

  test('behavior: explicit nonceKey overrides expiring nonce', async () => {
    const requests = await Promise.all([
      prepareTransactionRequest(client, {
        feePayer: true,
        nonceKey: 42n,
      }),
      prepareTransactionRequest(client, { feePayer: true }),
      prepareTransactionRequest(client, {
        feePayer: true,
        nonceKey: 100n,
      }),
    ])

    // Explicit nonceKey uses 2D nonce mode
    expect(requests[0]?.nonceKey).toBe(42n)
    expect(requests[0]?.validBefore).toBeUndefined()

    // Default feePayer uses expiring nonces
    expect(requests[1]?.nonceKey).toBe(maxUint256)
    expect(requests[1]?.validBefore).toBeDefined()

    expect(requests[2]?.nonceKey).toBe(100n)
    expect(requests[2]?.validBefore).toBeUndefined()
  })

  test('behavior: default nonceKey when feePayer is not set', async () => {
    const request = await prepareTransactionRequest(client, {})
    expect(request?.nonceKey).toBe(undefined)
    expect(request?.validBefore).toBeUndefined()
  })

  test('behavior: does not set gas when gas is not prepared', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: accounts.at(0)!,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feePayer: true,
      parameters: [],
    })

    expect(request.gas).toBeUndefined()
  })

  test('behavior: bumps prepared gas for sponsored access keys', async () => {
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: accounts.at(0)!,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feePayer: true,
      gas: 33_000n,
      parameters: [],
    })

    expect(request.gas).toBe(43_000n)
  })

  test('behavior: nonceKey expiring uses expiring nonces', async () => {
    const now = Math.floor(Date.now() / 1000)
    const request = await prepareTransactionRequest(client, {
      nonceKey: 'expiring',
    })
    expect(request?.nonceKey).toBe(maxUint256)
    expect(request?.nonce).toBe(0)
    expect(request?.validBefore).toBeGreaterThanOrEqual(now)
    expect(request?.validBefore).toBeLessThanOrEqual(now + 31)
  })

  test('behavior: numeric expiring nonce sentinel gets a validity window', async () => {
    const now = Math.floor(Date.now() / 1000)
    const request = await prepareTransactionRequest(client, {
      nonceKey: maxUint256,
      parameters: [],
    })

    expect(request.nonceKey).toBe(maxUint256)
    expect(request.nonce).toBe(0)
    expect(request.validBefore).toBeGreaterThanOrEqual(now)
    expect(request.validBefore).toBeLessThanOrEqual(now + 31)
  })

  test('behavior: explicit validity window is preserved', async () => {
    const customValidAfter = Math.floor(Date.now() / 1000) - 15
    const customValidBefore = Math.floor(Date.now() / 1000) + 15
    const request = await prepareTransactionRequest(client, {
      feePayer: true,
      validAfter: customValidAfter,
      validBefore: customValidBefore,
    })
    expect(request?.nonceKey).toBe(maxUint256)
    expect(request?.validAfter).toBe(customValidAfter)
    expect(request?.validBefore).toBe(customValidBefore)
  })

  test('behavior: expiring nonces do not consume a sequential nonce', async () => {
    const consume = vi.fn(async () => 7)
    const request = await prepareTransactionRequest(client, {
      feePayer: true,
      nonceManager: {
        consume,
        get: vi.fn(async () => 7),
        increment: vi.fn(),
        reset: vi.fn(),
      },
      parameters: ['nonce'],
    })

    expect(consume).not.toHaveBeenCalled()
    expect(request.nonceKey).toBe(maxUint256)
    expect(request.nonce).toBe(0)
  })

  test('behavior: detects concurrent JSON-RPC address accounts', async () => {
    const address = accounts.at(0)!.address
    const requests = await Promise.all([
      prepareTransactionRequest(client, {
        account: address,
        parameters: [],
      }),
      prepareTransactionRequest(client, {
        account: address.toLowerCase() as typeof address,
        parameters: [],
      }),
    ])

    expect(requests[0].nonceKey).toBe(maxUint256)
    expect(requests[1].nonceKey).toBe(maxUint256)
  })

  test('behavior: detects concurrency before asynchronous account preparation', async () => {
    let reads = 0
    let releaseSecondRead: (() => void) | undefined
    const secondRead = new Promise<undefined>((resolve) => {
      releaseSecondRead = () => resolve(undefined)
    })
    const keyAuthorizationManager = KeyAuthorizationManager.from({
      source: {
        get() {
          reads++
          if (reads === 1) return undefined
          return secondRead
        },
        remove() {},
        set() {},
      },
    })
    const account = Account.fromP256(generatePrivateKey(), {
      access: accounts.at(0)!,
      keyAuthorizationManager,
    })

    const firstPromise = prepareTransactionRequest(client, {
      account,
      parameters: [],
    })
    const secondPromise = prepareTransactionRequest(client, {
      account,
      parameters: [],
    })
    const first = await firstPromise
    releaseSecondRead?.()
    const second = await secondPromise

    expect(first.nonceKey).toBe(maxUint256)
    expect(second.nonceKey).toBe(maxUint256)
  })

  test('behavior: staggered requests use sequential nonces', async () => {
    const entered_1 = withResolvers<void>()
    const entered_2 = withResolvers<void>()
    const release = withResolvers<void>()
    let getCount = 0
    const keyAuthorizationManager = KeyAuthorizationManager.from({
      source: {
        async get() {
          getCount++
          if (getCount === 1) entered_1.resolve()
          if (getCount === 2) entered_2.resolve()
          await release.promise
          return undefined
        },
        remove() {},
        set() {},
      },
    })
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: accounts.at(0)!,
      keyAuthorizationManager,
    })
    let nonce = 7
    const consume = vi.fn(async () => nonce++)
    const nonceManager = {
      consume,
      get: vi.fn(async () => nonce),
      increment: vi.fn(),
      reset: vi.fn(),
    }

    const request_1 = prepareTransactionRequest(client, {
      account: accessKey,
      nonceManager,
      parameters: ['nonce'],
    })
    await entered_1.promise
    const request_2 = prepareTransactionRequest(client, {
      account: accessKey,
      nonceManager,
      parameters: ['nonce'],
    })
    await entered_2.promise
    release.resolve()

    const requests = await Promise.all([request_1, request_2])
    expect(requests.map((request) => request.nonce)).toEqual([7, 8])
    expect(requests.map((request) => request.nonceKey)).toEqual([
      undefined,
      undefined,
    ])
    expect(consume).toHaveBeenCalledTimes(2)
  })

  test('behavior: sendTransaction with expiring nonces', async () => {
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
    // biome-ignore lint/suspicious/noTsIgnore: previous versions of TS (in CI) mark this as infinite instantiation
    // @ts-ignore
    const transactions = await Promise.all([
      getTransaction(client, {
        hash: receipts[0].transactionHash,
      }),
      getTransaction(client, {
        hash: receipts[1].transactionHash,
      }),
      getTransaction(client, {
        hash: receipts[2].transactionHash,
      }),
    ])
    // Concurrent transactions automatically use expiring nonces
    expect(transactions[0].nonceKey).toBe(maxUint256)
    expect(transactions[1].nonceKey).toBe(maxUint256)
    expect(transactions[2].nonceKey).toBe(maxUint256)
  })

  test('behavior: feeToken from chain config', async () => {
    const chainWithFeeToken = defineChain({
      ...tempoLocalnet,
      feeToken,
    })
    const clientWithFeeToken = getClient({
      account: accounts.at(0)!,
      chain: chainWithFeeToken,
    })
    const request = await prepareTransactionRequest(clientWithFeeToken, {})
    expect(request.feeToken).toBe(feeToken)
  })

  test('behavior: keyAuthorizationManager attaches pending key authorization', async () => {
    const rootAccount = accounts.at(0)!
    const keyAuthorizationManager = KeyAuthorizationManager.memory()
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: rootAccount,
      keyAuthorizationManager,
    })
    const expiry = Math.floor((Date.now() + 30_000) / 1000)
    const keyAuthorization = await accessKeyActions.signAuthorization(client, {
      account: rootAccount,
      accessKey,
      expiry,
    })

    await keyAuthorizationManager.set(
      {
        address: accessKey.address,
        accessKey: accessKey.accessKeyAddress,
        chainId: client.chain.id,
      },
      keyAuthorization,
    )

    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      parameters: ['chainId'],
    })

    expect(request.keyAuthorization).toBe(keyAuthorization)
  })

  test('behavior: keyAuthorizationManager reads metadata without client account', async () => {
    const rootAccount = accounts.at(0)!
    const keyAuthorizationManager = KeyAuthorizationManager.memory()
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: rootAccount,
      keyAuthorizationManager,
    })
    const accessKeyClient = getClient({
      account: accessKey,
    })
    const expiry = Math.floor((Date.now() + 30_000) / 1000)
    const keyAuthorization = await accessKeyActions.signAuthorization(client, {
      account: rootAccount,
      accessKey,
      expiry,
    })

    await keyAuthorizationManager.set(
      {
        address: accessKey.address,
        accessKey: accessKey.accessKeyAddress,
        chainId: accessKeyClient.chain.id,
      },
      keyAuthorization,
    )

    const requestSpy = vi.spyOn(accessKeyClient, 'request')
    const request = await prepareTransactionRequest(accessKeyClient, {
      parameters: ['chainId'],
    })
    const requestCalls = requestSpy.mock.calls as [
      { method: string; params?: readonly unknown[] },
    ][]
    const metadataCall = requestCalls.find(([request]) => {
      if (request.method !== 'eth_call') return false
      const call = request.params?.[0] as { to?: string } | undefined
      return call?.to?.toLowerCase() === Addresses.accountKeychain.toLowerCase()
    })
    const call = metadataCall?.[0].params?.[0] as
      | { from?: string | undefined }
      | undefined

    expect(request.keyAuthorization).toBe(keyAuthorization)
    expect(call?.from).toBeUndefined()
  })

  test('behavior: keyAuthorizationManager removes authorization for authorized key', async () => {
    const rootAccount = accounts.at(0)!
    const keyAuthorizationManager = KeyAuthorizationManager.memory()
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: rootAccount,
      keyAuthorizationManager,
    })
    const expiry = Math.floor((Date.now() + 30_000) / 1000)
    const key = {
      address: accessKey.address,
      accessKey: accessKey.accessKeyAddress,
      chainId: client.chain.id,
    }
    const keyAuthorization = await accessKeyActions.signAuthorization(client, {
      account: rootAccount,
      accessKey,
      expiry,
    })

    await accessKeyActions.authorizeSync(client, { accessKey, expiry })
    await keyAuthorizationManager.set(key, keyAuthorization)

    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      parameters: ['chainId'],
    })

    expect(request.keyAuthorization).toBeUndefined()
    expect(await keyAuthorizationManager.get(key)).toBeUndefined()
  })
})

describe('formatters', () => {
  test('transaction formatter (getTransaction)', async () => {
    const receipt = await sendTransactionSync(client, {
      to: '0x0000000000000000000000000000000000000000',
      feeToken,
    })
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.hash).toBe(receipt.transactionHash)
    expect(transaction.blockTimestamp).toBeTypeOf('bigint')
    expect(transaction.type).toBe('tempo')
    expect(transaction.calls).toBeDefined()
    expect(transaction.signature).toBeDefined()
    expect(transaction.feeToken).toBe(feeToken)
  })

  test('transactionReceipt formatter (getTransactionReceipt)', async () => {
    const feePayerClient = getClient({
      account: accounts.at(1)!,
    })
    const receipt = await sendTransactionSync(feePayerClient, {
      to: '0x0000000000000000000000000000000000000000',
      feePayer: accounts.at(0)!,
    })
    const fullReceipt = await getTransactionReceipt(client, {
      hash: receipt.transactionHash,
    })
    expect(fullReceipt.transactionHash).toBe(receipt.transactionHash)
    expect(fullReceipt.feePayer?.toLowerCase()).toBe(
      accounts.at(0)!.address.toLowerCase(),
    )
  })
})

describe('serializers', () => {
  test('transaction serializer (signTransaction)', async () => {
    const request = await prepareTransactionRequest(client, {
      feeToken,
      to: '0x0000000000000000000000000000000000000000',
    })
    const serialized = await signTransaction(client, request as never)
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
    expect(serialized.startsWith('0x76')).toBe(true)
  })
})

describe('verifyHash', () => {
  test('p256: valid signature', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        hash,
        signature,
      }),
    ).toBe(true)
  })

  test('p256: invalid signature returns false', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const hash = hashMessage('hello world')
    const wrongHash = hashMessage('wrong message')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        hash: wrongHash,
        signature,
      }),
    ).toBe(false)
  })

  test('webCrypto: valid signature', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        hash,
        signature,
      }),
    ).toBe(true)
  })

  test('webCrypto: invalid signature returns false', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    const hash = hashMessage('hello world')
    const wrongHash = hashMessage('wrong message')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        hash: wrongHash,
        signature,
      }),
    ).toBe(false)
  })

  test('headlessWebAuthn: valid signature', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(privateKey, {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        hash,
        signature,
      }),
    ).toBe(true)
  })

  test('headlessWebAuthn: invalid signature returns false', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(privateKey, {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    const hash = hashMessage('hello world')
    const wrongHash = hashMessage('wrong message')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        hash: wrongHash,
        signature,
      }),
    ).toBe(false)
  })

  test('p256: wrong address returns false', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    // Create a different account to use as the wrong address
    const wrongAccount = Account.fromP256(P256.randomPrivateKey())

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    // Try to verify the signature with the wrong address - should fail
    expect(
      await verifyHash(client, {
        address: wrongAccount.address,
        hash,
        signature,
      }),
    ).toBe(false)
  })

  test('webCrypto: wrong address returns false', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    // Create a different account to use as the wrong address
    const wrongKeyPair = await WebCryptoP256.createKeyPair()
    const wrongAccount = Account.fromWebCryptoP256(wrongKeyPair)

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    // Try to verify the signature with the wrong address - should fail
    expect(
      await verifyHash(client, {
        address: wrongAccount.address,
        hash,
        signature,
      }),
    ).toBe(false)
  })

  test('headlessWebAuthn: wrong address returns false', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(privateKey, {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    // Create a different account to use as the wrong address
    const wrongAccount = Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    // Try to verify the signature with the wrong address - should fail
    expect(
      await verifyHash(client, {
        address: wrongAccount.address,
        hash,
        signature,
      }),
    ).toBe(false)
  })

  test('accessKey: valid signature', async () => {
    const rootAccount = accounts.at(0)!
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: rootAccount,
    })

    await accessKeyActions.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const hash = hashMessage('hello world')
    const signature = await accessKey.sign({ hash })

    expect(
      await verifyHash(client, {
        address: accessKey.address,
        hash,
        signature,
        mode: 'allowAccessKey',
      }),
    ).toBe(true)
  })

  test('accessKey: secp256k1 valid signature', async () => {
    const rootAccount = accounts.at(0)!
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: rootAccount,
    })

    await accessKeyActions.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const hash = hashMessage('hello world')
    const signature = await accessKey.sign({ hash })

    expect(
      await verifyHash(client, {
        address: accessKey.address,
        hash,
        signature,
        mode: 'allowAccessKey',
      }),
    ).toBe(true)
  })

  test('accessKey: invalid signature returns false', async () => {
    const rootAccount = accounts.at(0)!
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: rootAccount,
    })

    await accessKeyActions.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const hash = hashMessage('hello world')
    const wrongHash = hashMessage('wrong message')
    const signature = await accessKey.sign({ hash })

    expect(
      await verifyHash(client, {
        address: accessKey.address,
        hash: wrongHash,
        signature,
        mode: 'allowAccessKey',
      }),
    ).toBe(false)
  })

  test('accessKey: revoked key returns false', async () => {
    const rootAccount = accounts.at(0)!
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: rootAccount,
    })

    await accessKeyActions.authorizeSync(client, {
      accessKey,
      expiry: Math.floor((Date.now() + 30_000) / 1000),
    })

    const hash = hashMessage('hello world')
    const signature = await accessKey.sign({ hash })

    // Revoke the key
    await accessKeyActions.revokeSync(client, { accessKey })

    expect(
      await verifyHash(client, {
        address: accessKey.address,
        hash,
        signature,
        mode: 'allowAccessKey',
      }),
    ).toBe(false)
  })

  test('behavior: non-tempo chain', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        chain: mainnet,
        hash,
        signature,
      }),
    ).toBe(false)
  })

  test('behavior: non-tempo chain (client)', async () => {
    const client = createClient({
      chain: mainnet,
      transport: http('https://eth.drpc.org'),
    })

    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const hash = hashMessage('hello world')
    const signature = await account.sign({ hash })

    expect(
      await verifyHash(client, {
        address: account.address,
        hash,
        signature,
      }),
    ).toBe(false)
  })
})
