import * as HdKey from 'ox/HdKey'
import { describe, expect, test } from 'vitest'

import { accounts, typedData } from '~test/constants.js'
import * as Authorization from '../utils/Authorization.js'
import * as PersonalMessage from '../utils/PersonalMessage.js'
import * as TxEnvelope from '../utils/TxEnvelope.js'
import * as TypedData from '../utils/TypedData.js'
import * as Account from './Account.js'
import * as Secp256k1 from 'ox/Secp256k1'

const mnemonic = 'test test test test test test test test test test test junk'

const hdKey = HdKey.fromSeed(
  '0x9dfc3c64c2f8bede1533b6a79f8570e5943e0b8fd1cf77107adf7b72cef42185d564a3aee24cab43f80e3c4538087d70fc824eabbad596a23c97b6ee8322ccc0',
)

describe('from', () => {
  test('json-rpc account', () => {
    expect(Account.from(accounts[0].address)).toMatchInlineSnapshot(`
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

  test('local account', () => {
    expect(
      Account.from({
        address: accounts[0].address,
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
        "sign": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "custom",
        "type": "local",
      }
    `)
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
    expect(Account.fromPrivateKey(accounts[0].privateKey))
      .toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "privateKey",
        "type": "local",
      }
    `)
  })

  test('sign', async () => {
    const account = Account.fromPrivateKey(accounts[0].privateKey)
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
    const account = Account.fromPrivateKey(accounts[0].privateKey)
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
    const account = Account.fromPrivateKey(accounts[0].privateKey)
    const message = 'hello world'
    const signature = await account.signMessage({ message })
    expect(
      PersonalMessage.verify({ address: account.address, message, signature }),
    ).toBe(true)
  })

  test('sign transaction', async () => {
    const account = Account.fromPrivateKey(accounts[0].privateKey)
    const serialized = await account.signTransaction({
      type: 'eip1559',
      chainId: 1,
      maxFeePerGas: 20000000000n,
      gas: 21000n,
      to: accounts[1].address,
      value: 1000000000000000000n,
    })
    expect(
      TxEnvelope.recoverAddress(serialized as TxEnvelope.Serialized),
    ).toEqual(account.address.toLowerCase())
  })

  test('sign typed data', async () => {
    const account = Account.fromPrivateKey(accounts[0].privateKey)
    const data = { ...typedData.basic, primaryType: 'Mail' } as const
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
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "hd",
        "type": "local",
      }
    `)
  })

  describe('args: addressIndex', () => {
    Array.from({ length: 10 }).forEach((_, index) => {
      test(`addressIndex: ${index}`, () => {
        const account = Account.fromHdKey(hdKey, { addressIndex: index })
        expect(account.address.toLowerCase()).toEqual(accounts[index].address)
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
})

describe('fromMnemonic', () => {
  test('default', () => {
    expect(Account.fromMnemonic(mnemonic)).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "getHdKey": [Function],
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
        "signAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "hd",
        "type": "local",
      }
    `)
  })

  describe('args: addressIndex', () => {
    Array.from({ length: 10 }).forEach((_, index) => {
      test(`addressIndex: ${index}`, () => {
        const account = Account.fromMnemonic(mnemonic, { addressIndex: index })
        expect(account.address.toLowerCase()).toEqual(accounts[index].address)
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
})

describe('random', () => {
  test('default', () => {
    const account = Account.random()
    expect(account.address).toBeDefined()
    expect(account.publicKey).toBeDefined()
    expect(account.source).toBe('privateKey')
    expect(account.type).toBe('local')
  })
})
