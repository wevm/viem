import { Hex, P256, Secp256k1, WebCryptoP256 } from 'ox'
import { verifyMessage, verifyTypedData } from 'viem/actions'
import { Account, tempoActions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { client as baseClient } from '../../../test/src/tempo/config.js'
import * as actions from './account.js'

const client = baseClient.extend(tempoActions())

describe('verifyHash', () => {
  test('secp256k1: default signature', async () => {
    const privateKey = Secp256k1.randomPrivateKey()
    const account = Account.fromSecp256k1(privateKey)

    const hash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('secp256k1: without address (recovers from signature)', async () => {
    const privateKey = Secp256k1.randomPrivateKey()
    const account = Account.fromSecp256k1(privateKey)

    const hash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      hash,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('secp256k1: invalid signature returns false', async () => {
    const privateKey = Secp256k1.randomPrivateKey()
    const account = Account.fromSecp256k1(privateKey)

    const hash = Hex.random(32)
    const wrongHash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash: wrongHash,
      signature,
    })

    expect(valid).toBe(false)
  })

  test('p256: default signature', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const hash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('p256: invalid signature returns false', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const hash = Hex.random(32)
    const wrongHash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash: wrongHash,
      signature,
    })

    expect(valid).toBe(false)
  })

  test('webCrypto p256: default signature', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    const hash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('webCrypto p256: invalid signature returns false', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    const hash = Hex.random(32)
    const wrongHash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash: wrongHash,
      signature,
    })

    expect(valid).toBe(false)
  })

  test('headless webAuthn: default signature', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(privateKey, {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    const hash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('headless webAuthn: invalid signature returns false', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(privateKey, {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    const hash = Hex.random(32)
    const wrongHash = Hex.random(32)
    const signature = await account.sign({ hash })

    const valid = await actions.verifyHash(client, {
      address: account.address,
      hash: wrongHash,
      signature,
    })

    expect(valid).toBe(false)
  })

  test('behavior: signature from wrong account returns false', async () => {
    const privateKey1 = Secp256k1.randomPrivateKey()
    const account1 = Account.fromSecp256k1(privateKey1)

    const privateKey2 = Secp256k1.randomPrivateKey()
    const account2 = Account.fromSecp256k1(privateKey2)

    const hash = Hex.random(32)
    const signature = await account1.sign({ hash })

    // Try to verify with wrong address
    const valid = await actions.verifyHash(client, {
      address: account2.address,
      hash,
      signature,
    })

    expect(valid).toBe(false)
  })

  test('as inherited: verifyMessage with secp256k1', async () => {
    const privateKey = Secp256k1.randomPrivateKey()
    const account = Account.fromSecp256k1(privateKey)

    const message = 'Hello, World!'
    const signature = await account.signMessage({ message })

    const valid = await verifyMessage(client, {
      address: account.address,
      message,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('as inherited: verifyMessage with p256', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const message = 'Hello, P256!'
    const signature = await account.signMessage({ message })

    const valid = await verifyMessage(client, {
      address: account.address,
      message,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('as inherited: verifyMessage with webCrypto p256', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    const message = 'Hello, WebCrypto!'
    const signature = await account.signMessage({ message })

    const valid = await verifyMessage(client, {
      address: account.address,
      message,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('as inherited: verifyMessage with headless webAuthn', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(privateKey, {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    const message = 'Hello, WebAuthn!'
    const signature = await account.signMessage({ message })

    const valid = await verifyMessage(client, {
      address: account.address,
      message,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('as inherited: verifyTypedData with secp256k1', async () => {
    const privateKey = Secp256k1.randomPrivateKey()
    const account = Account.fromSecp256k1(privateKey)

    const domain = {
      name: 'Test App',
      version: '1',
      chainId: 1,
    }

    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
    }

    const message = {
      name: 'Alice',
      wallet: '0x0000000000000000000000000000000000000000',
    }

    const signature = await account.signTypedData({
      domain,
      types,
      primaryType: 'Person',
      message,
    })

    const valid = await verifyTypedData(client, {
      address: account.address,
      domain,
      types,
      primaryType: 'Person',
      message,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('as inherited: verifyTypedData with p256', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromP256(privateKey)

    const domain = {
      name: 'P256 App',
      version: '1',
      chainId: 1,
    }

    const types = {
      Message: [{ name: 'content', type: 'string' }],
    }

    const message = {
      content: 'Hello from P256!',
    }

    const signature = await account.signTypedData({
      domain,
      types,
      primaryType: 'Message',
      message,
    })

    const valid = await verifyTypedData(client, {
      address: account.address,
      domain,
      types,
      primaryType: 'Message',
      message,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('as inherited: verifyTypedData with webCrypto p256', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    const domain = {
      name: 'WebCrypto App',
      version: '1',
      chainId: 1,
    }

    const types = {
      Data: [
        { name: 'value', type: 'uint256' },
        { name: 'label', type: 'string' },
      ],
    }

    const message = {
      value: 42n,
      label: 'test',
    }

    const signature = await account.signTypedData({
      domain,
      types,
      primaryType: 'Data',
      message,
    })

    const valid = await verifyTypedData(client, {
      address: account.address,
      domain,
      types,
      primaryType: 'Data',
      message,
      signature,
    })

    expect(valid).toBe(true)
  })

  test('as inherited: verifyTypedData with headless webAuthn', async () => {
    const privateKey = P256.randomPrivateKey()
    const account = Account.fromHeadlessWebAuthn(privateKey, {
      rpId: 'example.com',
      origin: 'https://example.com',
    })

    const domain = {
      name: 'WebAuthn App',
      version: '1',
      chainId: 1,
    }

    const types = {
      Auth: [
        { name: 'user', type: 'address' },
        { name: 'action', type: 'string' },
      ],
    }

    const message = {
      user: account.address,
      action: 'login',
    }

    const signature = await account.signTypedData({
      domain,
      types,
      primaryType: 'Auth',
      message,
    })

    const valid = await verifyTypedData(client, {
      address: account.address,
      domain,
      types,
      primaryType: 'Auth',
      message,
      signature,
    })

    expect(valid).toBe(true)
  })
})
