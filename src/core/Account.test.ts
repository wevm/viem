import { HdKey, Secp256k1 } from 'ox'
import { describe, expect, test } from 'vitest'

import * as constants from '~test/constants.js'
import { Account, NonceManager } from 'viem'
import {
  Authorization,
  Hash,
  Hex,
  PersonalMessage,
  Signature,
  TxEnvelope,
  TypedData,
} from 'viem/utils'

const mnemonic = 'test test test test test test test test test test test junk'

const hdKey = HdKey.fromSeed(
  '0x9dfc3c64c2f8bede1533b6a79f8570e5943e0b8fd1cf77107adf7b72cef42185d564a3aee24cab43f80e3c4538087d70fc824eabbad596a23c97b6ee8322ccc0',
)

describe('from', () => {
  test('json-rpc account', () => {
    expect(Account.from(constants.accounts[0].address)).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      }
    `)
  })

  test('json-rpc account (invalid address)', () => {
    expect(() => Account.from('0x1')).toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0x1" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
  })

  test('returns an existing account unchanged', () => {
    const jsonRpc = Account.from(constants.accounts[0].address)
    const local = Account.fromPrivateKey(constants.accounts[0].privateKey)
    expect(Account.from(jsonRpc)).toBe(jsonRpc)
    expect(Account.from(local)).toBe(local)
  })

  test('local account', () => {
    expect(
      Account.from({
        address: constants.accounts[0].address,
        async sign() {
          return '0x' as const
        },
        async signMessage() {
          return '0x' as const
        },
        async signTransaction() {
          return '0x' as const
        },
        async signTypedData() {
          return '0x' as const
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "keyType": "custom",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "type": "local",
      }
    `)
  })

  test('derives address from publicKey', () => {
    const pk = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const account = Account.from({
      publicKey: pk.publicKey,
      sign: ({ hash }) => pk.sign({ hash }),
    })
    expect(account.address).toEqual(pk.address)
    expect(account.publicKey).toEqual(pk.publicKey)
  })

  test('derives signing methods from an async sign', async () => {
    const pk = Account.fromPrivateKey(constants.accounts[0].privateKey)
    // An async `sign` primitive exercises the derived methods' async path.
    const account = Account.from({
      address: pk.address,
      sign: async ({ hash }) => pk.sign({ hash }),
    })

    const serialized = await account.signTransaction({
      type: 'eip1559',
      chainId: 1,
      maxFeePerGas: 20000000000n,
      gas: 21000n,
      to: constants.accounts[1].address,
      value: 1000000000000000000n,
    })
    expect(
      TxEnvelope.recoverAddress(serialized as TxEnvelope.Serialized),
    ).toEqual(account.address.toLowerCase())

    const authorization = await account.signAuthorization!({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      chainId: 1,
      nonce: 0n,
    })
    expect(
      Secp256k1.recoverAddress({
        payload: Authorization.getSignPayload(authorization),
        signature: authorization,
      }).toLowerCase(),
    ).toEqual(account.address.toLowerCase())
  })

  test('local account (invalid address)', () => {
    expect(() =>
      Account.from({
        address: '0x1',
        async sign() {
          return '0x' as const
        },
        async signMessage() {
          return '0x' as const
        },
        async signTransaction() {
          return '0x' as const
        },
        async signTypedData() {
          return '0x' as const
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0x1" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
  })
})

describe('fromPrivateKey', () => {
  test('default', () => {
    expect(Account.fromPrivateKey(constants.accounts[0].privateKey))
      .toMatchInlineSnapshot(`
        {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "keyType": "secp256k1",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "type": "local",
        }
      `)
  })

  test('args: nonceManager', () => {
    const nonceManager = NonceManager.jsonRpc()
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey, {
      nonceManager,
    })
    expect(account.nonceManager).toBe(nonceManager)
  })

  test('sign', async () => {
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const payload =
      '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68'
    const signature = await account.sign({ hash: payload })
    expect(
      Secp256k1.verify({
        payload,
        publicKey: account.publicKey,
        signature,
      }),
    ).toBe(true)
  })

  test('sign authorization', async () => {
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const authorization = await account.signAuthorization!({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      chainId: 1,
      nonce: 0n,
    })
    expect(
      Authorization.verify({ authorization, address: account.address }),
    ).toBe(true)
  })

  test('sign message', async () => {
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const message = 'hello world'
    const signature = await account.signMessage({ message })
    expect(
      PersonalMessage.verify({ address: account.address, message, signature }),
    ).toBe(true)
  })

  test('sign message (raw)', async () => {
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const message = { raw: '0xdeadbeef' } as const
    const signature = await account.signMessage({ message })
    expect(
      PersonalMessage.verify({ address: account.address, message, signature }),
    ).toBe(true)
  })

  test('sign transaction', async () => {
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const serialized = await account.signTransaction({
      type: 'eip1559',
      chainId: 1,
      maxFeePerGas: 20000000000n,
      gas: 21000n,
      to: constants.accounts[1].address,
      value: 1000000000000000000n,
    })
    expect(
      TxEnvelope.recoverAddress(serialized as TxEnvelope.Serialized),
    ).toEqual(account.address.toLowerCase())
  })

  test('sign transaction (chain hooks)', async () => {
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const envelope = {
      type: 'eip1559',
      chainId: 1,
      maxFeePerGas: 20000000000n,
      gas: 21000n,
      to: constants.accounts[1].address,
      value: 1000000000000000000n,
    } as const

    const payload = Hash.keccak256(Hex.fromString('custom payload'))
    const chain = {
      transaction: {
        getSignPayload: () => payload,
        serialize: (
          _envelope: TxEnvelope.TxEnvelope,
          options?: { signature?: Signature.Signature },
        ) => Signature.toHex(options!.signature!),
      },
    } as never

    const serialized = await account.signTransaction(envelope, { chain })

    expect(
      Secp256k1.recoverAddress({
        payload,
        signature: Signature.fromHex(serialized as Hex.Hex),
      }).toLowerCase(),
    ).toEqual(account.address.toLowerCase())
  })

  test('sign typed data', async () => {
    const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
    const data = { ...constants.typedData.basic, primaryType: 'Mail' } as const
    const signature = await account.signTypedData(data)
    expect(
      TypedData.verify({ ...data, address: account.address, signature }),
    ).toBe(true)
  })
})

describe('fromHdKey', () => {
  test('default', () => {
    expect(Account.fromHdKey(hdKey)).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "getHdKey": [Function],
        "keyType": "secp256k1",
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "type": "local",
      }
    `)
  })

  describe('args: addressIndex', () => {
    Array.from({ length: 10 }).forEach((_, index) => {
      test(`addressIndex: ${index}`, () => {
        const account = Account.fromHdKey(hdKey, { addressIndex: index })
        expect(account.address.toLowerCase()).toEqual(
          constants.accounts[index].address,
        )
      })
    })
  })

  test('args: accountIndex', () => {
    expect(
      Account.fromHdKey(hdKey, { accountIndex: 1 }).address,
    ).toMatchInlineSnapshot(`"0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650"`)
  })

  test('return: getHdKey()', () => {
    const account = Account.fromHdKey(hdKey)
    expect(typeof account.getHdKey().derive).toBe('function')
  })

  test('args: nonceManager', () => {
    const nonceManager = NonceManager.jsonRpc()
    const account = Account.fromHdKey(hdKey, {
      nonceManager,
    })
    expect(account.nonceManager).toBe(nonceManager)
  })
})

describe('fromMnemonic', () => {
  test('default', () => {
    expect(Account.fromMnemonic(mnemonic)).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "getHdKey": [Function],
        "keyType": "secp256k1",
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "type": "local",
      }
    `)
  })

  describe('args: addressIndex', () => {
    Array.from({ length: 10 }).forEach((_, index) => {
      test(`addressIndex: ${index}`, () => {
        const account = Account.fromMnemonic(mnemonic, { addressIndex: index })
        expect(account.address.toLowerCase()).toEqual(
          constants.accounts[index].address,
        )
      })
    })
  })

  test('args: passphrase', () => {
    expect(
      Account.fromMnemonic(mnemonic, {
        passphrase: 'passphrase',
        accountIndex: 1,
      }).address,
    ).toMatchInlineSnapshot(`"0x3e6bd720D0659c05CCACf72cf71911780e315c34"`)
  })

  test('args: nonceManager', () => {
    const nonceManager = NonceManager.jsonRpc()
    const account = Account.fromMnemonic(mnemonic, {
      nonceManager,
    })
    expect(account.nonceManager).toBe(nonceManager)
  })
})

describe('random', () => {
  test('default', () => {
    const account = Account.random()
    expect(account.address).toBeDefined()
    expect(account.publicKey).toBeDefined()
    expect(account.keyType).toBe('secp256k1')
    expect(account.type).toBe('local')
  })
})
