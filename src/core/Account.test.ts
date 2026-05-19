import { describe, expect, test } from 'vp/test'

import { Account } from '../index.js'
import { Mnemonic, Value } from '../utils/index.js'

const privateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const recipientLower = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
const zeroAddress = '0x0000000000000000000000000000000000000000'
const mnemonic = 'test test test test test test test test test test test junk'

const typedData = {
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: address,
    },
    to: {
      name: 'Bob',
      wallet: recipient,
    },
    contents: 'Hello, Bob!',
  },
} as const

describe('from', () => {
  test('behavior: creates a json-rpc account from an address', () => {
    expect(Account.from(zeroAddress)).toMatchInlineSnapshot(`
      {
        "address": "0x0000000000000000000000000000000000000000",
        "type": "json-rpc",
      }
    `)
  })

  test('behavior: returns existing account objects', () => {
    const account = Account.fromPrivateKey(privateKey)

    expect(Account.from(account)).toBe(account)
  })
})

describe('fromJsonRpc', () => {
  test('behavior: rejects invalid addresses', () => {
    expect(() => Account.fromJsonRpc('0x1' as never))
      .toThrowErrorMatchingInlineSnapshot(`
      [Account.InvalidAddressError: Address "0x1" is invalid.

      Address must be a hex value of 20 bytes.

      Version: viem@2.49.3]
    `)
  })
})

describe('fromLocal', () => {
  test('behavior: creates a custom local account with fallback signers', async () => {
    const account = Account.fromLocal({
      address,
      source: 'custom',
      async sign() {
        return '0x1234'
      },
    })

    expect(account.type).toBe('local')
    expect(account.source).toBe('custom')
    await expect(account.signMessage({ message: 'hello world' })).resolves.toBe(
      '0x1234',
    )
  })
})

describe('fromPrivateKey', () => {
  test('behavior: creates a private-key account', () => {
    const account = Account.fromPrivateKey(privateKey)

    expect(account.address).toBe(address)
    expect(account.source).toBe('privateKey')
    expect(account.type).toBe('local')
    expect(account.publicKey).toMatchInlineSnapshot(`
      {
        "prefix": 4,
        "x": "0x8318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed75",
        "y": "0x3547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
      }
    `)
  })

  test('behavior: signs raw payloads', async () => {
    const account = Account.fromPrivateKey(privateKey)

    await expect(
      Account.sign(account, {
        payload:
          '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      }),
    ).resolves.toMatchInlineSnapshot(
      `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
    )
  })

  test('behavior: signs messages', async () => {
    const account = Account.fromPrivateKey(privateKey)

    await expect(
      Account.signMessage(account, { message: 'hello world' }),
    ).resolves.toMatchInlineSnapshot(
      `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
    )
  })

  test('behavior: signs typed data', async () => {
    const account = Account.fromPrivateKey(privateKey)

    await expect(
      Account.signTypedData(account, typedData),
    ).resolves.toMatchInlineSnapshot(
      `"0x67a8262428d913e5847f14e3eb7c3ab3be7f386c2a0e848d365ddc8661f6409b413b35729c862b04b152d2199c26827f21263006701b0b6431b175ca5bf74a6f1c"`,
    )
  })

  test('behavior: signs authorizations', async () => {
    const account = Account.fromPrivateKey(privateKey)

    await expect(
      Account.signAuthorization(account, {
        address: zeroAddress,
        chainId: 1,
        nonce: 0n,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x0000000000000000000000000000000000000000",
        "chainId": 1,
        "nonce": 0n,
        "r": "0x3c35d6df195a251dca39364c71144c91dbf3530aae6461521a9f4455401e4368",
        "s": "0x1e0af8f6b2c79db6e58a31585915d2c3fb060707fd8678ec5cfd4dbae2c3730e",
        "yParity": 0,
      }
    `)
  })

  test('behavior: signs transactions', async () => {
    const account = Account.fromPrivateKey(privateKey)

    await expect(
      Account.signTransaction(account, {
        chainId: 1,
        maxFeePerGas: Value.fromGwei('20'),
        gas: 21_000n,
        to: recipientLower,
        value: Value.fromEther('1'),
      }),
    ).resolves.toMatchInlineSnapshot(
      `"0x02f86f0180808504a817c8008252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c001a0f40a2d2ae9638056cafbe9083c7125edc8555e0e715db0984dd859a5c6dfac57a020f36fd0b32bef4d6d75c62f220e59c5fb60c244ca3b361e750985ee5c3a0931"`,
    )
  })
})

describe('fromMnemonic', () => {
  test('behavior: derives the default mnemonic account', () => {
    const account = Account.fromMnemonic(mnemonic)

    expect(account.address).toBe(address)
    expect(account.source).toBe('mnemonic')
    expect(account.getHdKey().privateKey).toBe(privateKey)
  })

  test('behavior: supports path options', () => {
    expect(Account.fromMnemonic(mnemonic, { addressIndex: 1 }).address).toBe(
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    )
    expect(Account.fromMnemonic(mnemonic, { accountIndex: 1 }).address).toBe(
      '0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650',
    )
    expect(Account.fromMnemonic(mnemonic, { changeIndex: 1 }).address).toBe(
      '0x4b39F7b0624b9dB86AD293686bc38B903142dbBc',
    )
  })

  test('behavior: supports passphrases', () => {
    expect(
      Account.fromMnemonic(mnemonic, {
        accountIndex: 1,
        passphrase: 'passphrase',
      }).address,
    ).toBe('0x3e6bd720D0659c05CCACf72cf71911780e315c34')
  })
})

describe('fromHdKey', () => {
  test('behavior: derives an account from a hd key', () => {
    const hdKey = Mnemonic.toHdKey(mnemonic)
    const account = Account.fromHdKey(hdKey)

    expect(account.source).toBe('hd')
    expect(account.getHdKey().privateKey).toBe(privateKey)
  })

  test('behavior: accepts mnemonic hd keys', () => {
    const account = Account.fromHdKey(Mnemonic.toHdKey(mnemonic), {
      addressIndex: 1,
    })

    expect(account.address).toBe(recipient)
  })
})

describe('sign', () => {
  test('behavior: rejects json-rpc accounts', async () => {
    await expect(
      Account.sign(Account.fromJsonRpc(zeroAddress), { payload: '0x00' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Account.SignNotSupportedError: Account does not support local signing.

      Version: viem@2.49.3]
    `)
  })
})
