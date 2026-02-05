import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
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
import { Account, P256, WebCryptoP256 } from './index.js'

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

  test('behavior: explicit validBefore is preserved', async () => {
    const customValidBefore = Math.floor(Date.now() / 1000) + 15
    const request = await prepareTransactionRequest(client, {
      feePayer: true,
      validBefore: customValidBefore,
    })
    expect(request?.nonceKey).toBe(maxUint256)
    expect(request?.validBefore).toBe(customValidBefore)
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
      transport: http(),
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
