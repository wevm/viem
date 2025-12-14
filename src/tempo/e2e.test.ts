import * as Http from 'node:http'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { RpcRequest, RpcResponse, WebCryptoP256 } from 'ox'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  defaultPrepareTransactionRequestParameters,
  getTransaction,
  prepareTransactionRequest,
  sendRawTransaction,
  sendTransaction,
  sendTransactionSync,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Account, Actions, Transaction } from 'viem/tempo'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  chain,
  fundAddress,
  getClient,
  http,
} from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'
import { withFeePayer } from './Transport.js'

const client = getClient()

describe('sendTransaction', () => {
  test('default', async () => {
    const account = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      r,
      s,
      v,
      yParity,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(r).toBeDefined()
    expect(s).toBeDefined()
    expect(v).toBeDefined()
    expect(yParity).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "data": "0xdeadbeef",
        "feePayerSignature": undefined,
        "input": "0xdeadbeef",
        "to": "0x0000000000000000000000000000000000000000",
        "type": "eip1559",
        "typeHex": "0x2",
        "value": 0n,
      }
    `)
  })

  test('behavior: with `feeToken`', async () => {
    const account = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      data: '0xdeadbeef',
      feeToken: '0x20c0000000000000000000000000000000000001',
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "authorizationList": [],
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0x0000000000000000000000000000000000000000",
            "value": 0n,
          },
        ],
        "data": undefined,
        "feePayerSignature": undefined,
        "feeToken": "0x20c0000000000000000000000000000000000001",
        "maxFeePerBlobGas": undefined,
        "to": null,
        "type": "tempo",
        "typeHex": "0x76",
        "v": undefined,
        "validAfter": null,
        "validBefore": null,
        "value": 0n,
        "yParity": undefined,
      }
    `)
  })

  test('behavior: with `feeToken` (chain)', async () => {
    const client = getClient({
      account: accounts[0],
      chain: chain.extend({
        feeToken: '0x20c0000000000000000000000000000000000001',
      }),
    })

    const hash = await sendTransaction(client, {
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(from).toBe(accounts[0].address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "authorizationList": [],
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0x0000000000000000000000000000000000000000",
            "value": 0n,
          },
        ],
        "data": undefined,
        "feePayerSignature": undefined,
        "feeToken": "0x20c0000000000000000000000000000000000001",
        "maxFeePerBlobGas": undefined,
        "to": null,
        "type": "tempo",
        "typeHex": "0x76",
        "v": undefined,
        "validAfter": null,
        "validBefore": null,
        "value": 0n,
        "yParity": undefined,
      }
    `)
  })

  test('behavior: with `calls`', async () => {
    const account = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      calls: [
        Actions.token.create.call({
          admin: accounts[0].address,
          currency: 'USD',
          name: 'Test Token 3',
          symbol: 'TEST3',
        }),
      ],
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      calls,
      chainId,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(calls?.length).toBe(1)
    expect(chainId).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
  })

  test('behavior: with `feePayer`', async () => {
    const account = privateKeyToAccount(generatePrivateKey())
    const feePayer = accounts[0]

    const hash = await sendTransaction(client, {
      account,
      feePayer,
      to: '0x0000000000000000000000000000000000000000',
    })
    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      feePayerSignature,
      from,
      gas,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(feePayerSignature).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gas).toBeDefined()
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
  })

  test('behavior: with access key', async () => {
    const account = accounts[0]
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await account.signKeyAuthorization(accessKey)

    {
      const receipt = await sendTransactionSync(client, {
        account: accessKey,
        keyAuthorization,
      })
      expect(receipt).toBeDefined()
    }

    {
      const receipt = await Actions.token.transferSync(client, {
        account: accessKey,
        amount: 100n,
        token: '0x20c0000000000000000000000000000000000001',
        to: '0x0000000000000000000000000000000000000001',
      })
      expect(receipt).toBeDefined()
    }

    {
      const receipt = await Actions.token.createSync(client, {
        account: accessKey,
        admin: accessKey.address,
        currency: 'USD',
        name: 'Test Token 4',
        symbol: 'TEST4',
      })
      expect(receipt).toBeDefined()
    }
  })

  describe('p256', () => {
    test('default', async () => {
      const account = Account.fromP256(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0xdeadbeef",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `calls`', async () => {
      const account = Account.fromP256(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.create.call({
            admin: account.address,
            currency: 'USD',
            name: 'Test Token 4',
            symbol: 'TEST4',
          }),
        ],
        // TODO: remove once `eth_estimateGas` supports passing key type.
        gas: 100_000n,
      })

      const {
        blockHash,
        blockNumber,
        calls,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(calls?.length).toBe(1)
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `feePayer`', async () => {
      const account = Account.fromP256(
        // unfunded account with different key
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      )
      const feePayer = accounts[0]

      const hash = await sendTransaction(client, {
        account,
        feePayer,
        to: '0x0000000000000000000000000000000000000000',
      })
      await waitForTransactionReceipt(client, { hash })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash: hash_,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash_).toBe(hash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with access key', async () => {
      const account = accounts[0]
      const accessKey = Account.fromP256(generatePrivateKey(), {
        access: account,
      })

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          keyAuthorization,
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })

    test('behavior: with access key + `feePayer`', async () => {
      const account = Account.fromP256(
        // unfunded account with different key
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      )
      const accessKey = Account.fromP256(generatePrivateKey(), {
        access: account,
      })
      const feePayer = accounts[0]

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          feePayer,
          keyAuthorization,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          feePayer,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })
  })

  describe('webcrypto', () => {
    test('default', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0xdeadbeef",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "gas": 29012n,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `calls`', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.create.call({
            admin: account.address,
            currency: 'USD',
            name: 'Test Token 5',
            symbol: 'TEST5',
          }),
        ],
        // TODO: remove once `eth_estimateGas` supports passing key type.
        gas: 100_000n,
      })

      const {
        blockHash,
        blockNumber,
        calls,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        signature,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(calls?.length).toBe(1)
      expect(chainId).toBeDefined()
      expect(from).toBeDefined()
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(signature).toBeDefined()
      expect(transaction).toBeDefined()
    })

    test('behavior: with `feePayer`', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)
      const feePayer = accounts[0]

      const hash = await sendTransaction(client, {
        account,
        feePayer,
        to: '0x0000000000000000000000000000000000000000',
      })
      await waitForTransactionReceipt(client, { hash })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gasPrice,
        hash: hash_,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        signature,
        ...transaction
      } = await getTransaction(client, { hash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash_).toBe(hash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(signature).toBeDefined()
      expect(transaction).toBeDefined()
    })

    test('behavior: with access key', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)
      const accessKey = Account.fromWebCryptoP256(keyPair, {
        access: account,
      })

      // fund account
      await fundAddress(client, { address: account.address })

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          keyAuthorization,
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })
  })

  describe('webAuthn', () => {
    test('default', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0xdeadbeef",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `calls`', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )

      // fund account
      await fundAddress(client, { address: account.address })

      const receipt = await sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.create.call({
            admin: account.address,
            currency: 'USD',
            name: 'Test Token 6',
            symbol: 'TEST6',
          }),
        ],
        // TODO: remove once `eth_estimateGas` supports passing key type.
        gas: 100_000n,
      })

      const {
        blockHash,
        blockNumber,
        calls,
        chainId,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(calls?.length).toBe(1)
      expect(chainId).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with `feePayer`', async () => {
      const account = Account.fromHeadlessWebAuthn(
        // unfunded account with different key
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )
      const feePayer = accounts[0]

      const hash = await sendTransaction(client, {
        account,
        feePayer,
        to: '0x0000000000000000000000000000000000000000',
      })
      await waitForTransactionReceipt(client, { hash })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash: hash_,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash_).toBe(hash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x0000000000000000000000000000000000000000",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: with access key', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x6a3086fb3f2f95a3f36ef5387d18151ff51dc98a1e0eb987b159ba196beb0c99',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )
      const accessKey = Account.fromP256(generatePrivateKey(), {
        access: account,
      })

      // fund account
      await fundAddress(client, { address: account.address })

      const keyAuthorization = await account.signKeyAuthorization(accessKey)

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          keyAuthorization,
        })
        expect(receipt).toBeDefined()
      }

      {
        const receipt = await sendTransactionSync(client, {
          account: accessKey,
          to: '0x0000000000000000000000000000000000000000',
        })
        expect(receipt).toBeDefined()
      }
    })
  })

  test('behavior: 2d nonces', async () => {
    const account = accounts[0]

    // fund account
    await fundAddress(client, { address: account.address })

    const receipts = await Promise.all([
      sendTransactionSync(client, {
        account,
        nonceKey: 'random',
        to: '0x0000000000000000000000000000000000000000',
      }),
      sendTransactionSync(client, {
        account,
        nonceKey: 'random',
        to: '0x0000000000000000000000000000000000000000',
      }),
    ])

    expect(receipts[0].status).toBe('success')
    expect(receipts[1].status).toBe('success')
    expect(receipts[0].transactionHash).not.toBe(receipts[1].transactionHash)
  })

  test('behavior: 2d nonces (implicit)', async () => {
    const account = accounts[0]

    // fund account
    await fundAddress(client, { address: account.address })

    const receipts = await Promise.all([
      sendTransactionSync(client, {
        account,
        to: '0x0000000000000000000000000000000000000000',
      }),
      sendTransactionSync(client, {
        account,
        to: '0x0000000000000000000000000000000000000000',
      }),
      sendTransactionSync(client, {
        account,
        to: '0x0000000000000000000000000000000000000000',
      }),
    ])

    const transactions = await Promise.all([
      getTransaction(client, { hash: receipts[0].transactionHash }),
      getTransaction(client, { hash: receipts[1].transactionHash }),
      getTransaction(client, { hash: receipts[2].transactionHash }),
    ])

    expect(transactions[0].nonceKey).toBe(undefined)
    expect(transactions[1].nonceKey).toBeGreaterThan(0n)
    expect(transactions[2].nonceKey).toBeGreaterThan(0n)
  })
})

describe('signTransaction', () => {
  test('default', async () => {
    const account = privateKeyToAccount(
      // unfunded PK
      '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
    )
    const feePayer = accounts[0]

    const request = await prepareTransactionRequest(client, {
      account,
      data: '0xdeadbeef',
      feePayer: true,
      parameters: defaultPrepareTransactionRequestParameters,
      to: '0xcafebabecafebabecafebabecafebabecafebabe',
    })
    let transaction = await signTransaction(client, request as never)

    transaction = await signTransaction(client, {
      ...Transaction.deserialize(transaction),
      account,
      feePayer,
    } as never)
    const hash = await sendRawTransaction(client, {
      serializedTransaction: transaction,
    })

    await waitForTransactionReceipt(client, { hash })

    const {
      blockHash,
      blockNumber,
      chainId,
      feePayerSignature,
      from,
      gasPrice,
      hash: hash_,
      keyAuthorization: __,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      nonceKey,
      signature,
      transactionIndex,
      ...transaction2
    } = await getTransaction(client, { hash })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(chainId).toBeDefined()
    expect(feePayerSignature).toBeDefined()
    expect(from).toBe(account.address.toLowerCase())
    expect(gasPrice).toBeDefined()
    expect(hash_).toBe(hash)
    expect(maxFeePerGas).toBeDefined()
    expect(maxPriorityFeePerGas).toBeDefined()
    expect(nonce).toBeDefined()
    expect(nonceKey).toBeDefined()
    expect(signature).toBeDefined()
    expect(transactionIndex).toBeDefined()
    expect(transaction2).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "authorizationList": [],
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0xcafebabecafebabecafebabecafebabecafebabe",
            "value": 0n,
          },
        ],
        "data": undefined,
        "feeToken": null,
        "gas": 24002n,
        "maxFeePerBlobGas": undefined,
        "to": null,
        "type": "tempo",
        "typeHex": "0x76",
        "v": undefined,
        "validAfter": null,
        "validBefore": null,
        "value": 0n,
        "yParity": undefined,
      }
    `)
  })
})

describe('relay', () => {
  const client = getClient({
    transport: withFeePayer(http(), http('http://localhost:3050')),
  })
  let server: Http.Server

  afterEach(async () => {
    await fetch(`${rpcUrl}/restart`)
  })

  beforeAll(async () => {
    server = Http.createServer(
      createRequestListener(async (r) => {
        const client = getClient({
          account: accounts[0],
        })

        const request = RpcRequest.from(await r.json())

        // Validate method
        if (
          (request as any).method !== 'eth_signRawTransaction' &&
          request.method !== 'eth_sendRawTransaction' &&
          request.method !== 'eth_sendRawTransactionSync'
        )
          return Response.json(
            RpcResponse.from(
              {
                error: new RpcResponse.InvalidParamsError({
                  message:
                    'service only supports `eth_signTransaction`, `eth_sendRawTransaction`, and `eth_sendRawTransactionSync`',
                }),
              },
              { request },
            ),
          )

        const serialized = request.params?.[0] as `0x76${string}`
        if (!serialized.startsWith('0x76'))
          return Response.json(
            RpcResponse.from(
              {
                error: new RpcResponse.InvalidParamsError({
                  message: 'service only supports `0x76` transactions',
                }),
              },
              { request },
            ),
          )

        const transaction = Transaction.deserialize(serialized)
        const serializedTransaction = await signTransaction(client, {
          ...transaction,
          feePayer: client.account,
        })

        // Handle based on RPC method
        if ((request as any).method === 'eth_signRawTransaction') {
          // Policy: 'sign-only' - Return signed transaction without broadcasting
          return Response.json(
            RpcResponse.from({ result: serializedTransaction }, { request }),
          )
        }

        // Policy: 'sign-and-broadcast' - Sign, broadcast, and return hash
        const result = await client.request({
          method: request.method,
          params: [serializedTransaction],
        } as never)

        return Response.json(RpcResponse.from({ result }, { request }))
      }),
    ).listen(3050)
  })

  afterAll(() => {
    server.close()
    process.on('SIGINT', () => {
      server.close()
      process.exit(0)
    })
    process.on('SIGTERM', () => {
      server.close()
      process.exit(0)
    })
  })

  describe('secp256k1', () => {
    test('default', async () => {
      const account = privateKeyToAccount(
        // unfunded PK
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash: receipt.transactionHash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x095ea7b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064",
              "to": "0x20c0000000000000000000000000000000000001",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })

    test('behavior: 2d nonces', async () => {
      const account = privateKeyToAccount(
        // unfunded PK
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const receipts = await Promise.all([
        sendTransactionSync(client, {
          account,
          feePayer: true,
          to: '0x0000000000000000000000000000000000000000',
        }),
        sendTransactionSync(client, {
          account,
          feePayer: true,
          to: '0x0000000000000000000000000000000000000001',
        }),
        sendTransactionSync(client, {
          account,
          feePayer: true,
          to: '0x0000000000000000000000000000000000000002',
        }),
      ])

      expect(receipts.every((receipt) => receipt.status === 'success')).toBe(
        true,
      )
    })

    test('behavior: policy: sign-and-broadcast', async () => {
      const client = getClient({
        transport: withFeePayer(http(), http('http://localhost:3050'), {
          policy: 'sign-and-broadcast',
        }),
      })

      // unfunded account that needs sponsorship
      const account = privateKeyToAccount(
        '0xecc3fe55647412647e5c6b657c496803b08ef956f927b7a821da298cfbdd9666',
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      expect(receipt.status).toBe('success')
    })
  })

  describe('p256', () => {
    test('default', async () => {
      const account = Account.fromP256(
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash: receipt.transactionHash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x095ea7b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064",
              "to": "0x20c0000000000000000000000000000000000001",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })
  })

  describe('webcrypto', () => {
    test('default', async () => {
      const keyPair = await WebCryptoP256.createKeyPair()
      const account = Account.fromWebCryptoP256(keyPair)

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })

      expect(transaction).toBeDefined()
    })
  })

  describe('webAuthn', () => {
    test('default', async () => {
      const account = Account.fromHeadlessWebAuthn(
        '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        {
          rpId: 'localhost',
          origin: 'http://localhost',
        },
      )

      const { receipt } = await Actions.token.approveSync(client, {
        account,
        amount: 100n,
        feePayer: true,
        spender: '0x0000000000000000000000000000000000000000',
        token: 1n,
      })

      const {
        blockHash,
        blockNumber,
        chainId,
        feePayerSignature,
        from,
        gas,
        gasPrice,
        hash,
        keyAuthorization: __,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceKey,
        signature,
        transactionIndex,
        ...transaction
      } = await getTransaction(client, { hash: receipt.transactionHash })

      expect(blockHash).toBeDefined()
      expect(blockNumber).toBeDefined()
      expect(chainId).toBeDefined()
      expect(feePayerSignature).toBeDefined()
      expect(from).toBe(account.address.toLowerCase())
      expect(gas).toBeDefined()
      expect(gasPrice).toBeDefined()
      expect(hash).toBe(receipt.transactionHash)
      expect(maxFeePerGas).toBeDefined()
      expect(maxPriorityFeePerGas).toBeDefined()
      expect(nonce).toBeDefined()
      expect(nonceKey).toBeDefined()
      expect(signature).toBeDefined()
      expect(transactionIndex).toBeDefined()
      expect(transaction).toMatchInlineSnapshot(`
        {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x095ea7b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000064",
              "to": "0x20c0000000000000000000000000000000000001",
              "value": 0n,
            },
          ],
          "data": undefined,
          "feeToken": null,
          "maxFeePerBlobGas": undefined,
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "v": undefined,
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
          "yParity": undefined,
        }
      `)
    })
  })
})
