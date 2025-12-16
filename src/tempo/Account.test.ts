import { Value, WebCryptoP256 } from 'ox'
import { SignatureEnvelope } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempo/config.js'
import { verifyHash, verifyMessage, verifyTypedData } from '../actions/index.js'
import { parseGwei } from '../utils/index.js'
import * as Account from './Account.js'

const client = tempo.getClient()

const privateKey_secp256k1 =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const privateKey_p256 =
  '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28'

describe('fromSecp256k1', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    expect(account).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "keyType": "secp256k1",
        "publicKey": "0x8318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
        "signAuthorization": [Function],
        "signKeyAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "root",
        "type": "local",
      }
    `)

    const signature = await account.sign({
      hash: '0xdeadbeef',
    })
    expect(signature).toMatchInlineSnapshot(
      `"0xfa78c5905fb0b9d6066ef531f962a62bc6ef0d5eb59ecb134056d206f75aaed7780926ff2601a935c2c79707d9e1799948c9f19dcdde1e090e903b19a07923d01c"`,
    )
    expect(SignatureEnvelope.deserialize(signature)).toMatchInlineSnapshot(`
      {
        "signature": {
          "r": 113291597329930009559670063131885256927775966057121513567941051428123344285399n,
          "s": 54293712598725100598138577281441749550405991478212695085505730636505228583888n,
          "yParity": 1,
        },
        "type": "secp256k1",
      }
    `)
  })

  test('behavior: access key', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const access = Account.fromSecp256k1(
      '0x06a952d58c24d287245276dd8b4272d82a921d27d90874a6c27a3bc19ff4bfde',
      {
        access: account,
      },
    )

    const signature = await access.sign({
      hash: '0xdeadbeef',
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x03f39Fd6e51aad88F6F4ce6aB8827279cffFb9226627c4025daa5c473942fd6282cfb7c07edb48a1764fb3c228fc094a715300e0e56fcf8a7849bb8bcc2938d8a041fdbce56d2b6c70aadbae6a0b70b4a1e98256161b"`,
    )
    expect(SignatureEnvelope.deserialize(signature)).toMatchInlineSnapshot(`
      {
        "inner": {
          "signature": {
            "r": 17986519448152736741806679848301503760738507672285374215138617395147700232421n,
            "s": 50573419219106101097329274608677894804280434221354410855341207650465321473558n,
            "yParity": 0,
          },
          "type": "secp256k1",
        },
        "type": "keychain",
        "userAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
  })
})

describe('fromP256', () => {
  test('default', async () => {
    const account = Account.fromP256(privateKey_p256)
    expect(account).toMatchInlineSnapshot(`
      {
        "address": "0xc3Cf8B814B729A1ad648b49fbBdED3767BCd35fd",
        "keyType": "p256",
        "publicKey": "0x20fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240",
        "sign": [Function],
        "signAuthorization": [Function],
        "signKeyAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "root",
        "type": "local",
      }
    `)

    const signature = await account.sign({
      hash: '0xdeadbeef',
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x01daab749a3dea3f76c52ff0cfc86f0d433ecaf4d20f2ea327042bf5c15bccf847098dc3591fc68bf94d8db6d16cf326808dbf0f44d8e8373e8a7fcaf39b38281020fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240007777777777777777777777777777777777777777777777777777777777777777"`,
    )

    expect(
      await verifyHash(client, {
        address: account.address,
        hash: '0xdeadbeef',
        signature,
      }),
    ).toBe(true)
  })

  test('behavior: access key', async () => {
    const account = Account.fromP256(privateKey_p256)
    const access = Account.fromP256(
      '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28',
      {
        access: account,
      },
    )

    const signature = await access.sign({
      hash: '0xdeadbeef',
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x03c3Cf8B814B729A1ad648b49fbBdED3767BCd35fd01daab749a3dea3f76c52ff0cfc86f0d433ecaf4d20f2ea327042bf5c15bccf847098dc3591fc68bf94d8db6d16cf326808dbf0f44d8e8373e8a7fcaf39b38281020fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c81224000"`,
    )
    expect(SignatureEnvelope.deserialize(signature)).toMatchInlineSnapshot(`
      {
        "inner": {
          "prehash": false,
          "publicKey": {
            "prefix": 4,
            "x": 14922859167660714031319135249406228569331107293314503672038378501577989797848n,
            "y": 57892587925019714505251703757706314187537979987563648366993255393643804566080n,
          },
          "signature": {
            "r": 98907136600157604623356371387339224256063842362088951992859252568183251204167n,
            "s": 4321289316702385668777418513388640777474210589895706234285069930616319387664n,
          },
          "type": "p256",
        },
        "type": "keychain",
        "userAddress": "0xc3Cf8B814B729A1ad648b49fbBdED3767BCd35fd",
      }
    `)
  })
})

describe('fromHeadlessWebAuthn', () => {
  test('default', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      rpId: 'localhost',
      origin: 'http://localhost',
    })
    expect(account).toMatchInlineSnapshot(`
      {
        "address": "0xc3Cf8B814B729A1ad648b49fbBdED3767BCd35fd",
        "keyType": "webAuthn",
        "publicKey": "0x20fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240",
        "sign": [Function],
        "signAuthorization": [Function],
        "signKeyAuthorization": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "root",
        "type": "local",
      }
    `)

    const signature = await account.sign({
      hash: '0xdeadbeef',
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x0249960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d976305000000007b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a223371322d3777222c226f726967696e223a22687474703a2f2f6c6f63616c686f7374222c2263726f73734f726967696e223a66616c73657d1b3346991a9ad1498e401dc0448e93d1bde113778d442f5bcafc44925cf3121961e9b1c21b054e54fe6c2eec0cd310c8535b7e7dd1f7dd7bf749e6d78154b48120fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c8122407777777777777777777777777777777777777777777777777777777777777777"`,
    )

    expect(
      await verifyHash(client, {
        address: account.address,
        hash: '0xdeadbeef',
        signature,
      }),
    ).toBe(true)
  })

  test('behavior: access key', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      rpId: 'localhost',
      origin: 'http://localhost',
    })
    const access = Account.fromHeadlessWebAuthn(privateKey_p256, {
      access: account,
      rpId: 'localhost',
      origin: 'http://localhost',
    })

    const signature = await access.sign({
      hash: '0xdeadbeef',
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x03c3Cf8B814B729A1ad648b49fbBdED3767BCd35fd0249960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d976305000000007b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a223371322d3777222c226f726967696e223a22687474703a2f2f6c6f63616c686f7374222c2263726f73734f726967696e223a66616c73657d1b3346991a9ad1498e401dc0448e93d1bde113778d442f5bcafc44925cf3121961e9b1c21b054e54fe6c2eec0cd310c8535b7e7dd1f7dd7bf749e6d78154b48120fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240"`,
    )
    expect(SignatureEnvelope.deserialize(signature)).toMatchInlineSnapshot(`
      {
        "inner": {
          "metadata": {
            "authenticatorData": "0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000",
            "clientDataJSON": "{"type":"webauthn.get","challenge":"3q2-7w","origin":"http://localhost","crossOrigin":false}",
          },
          "publicKey": {
            "prefix": 4,
            "x": 14922859167660714031319135249406228569331107293314503672038378501577989797848n,
            "y": 57892587925019714505251703757706314187537979987563648366993255393643804566080n,
          },
          "signature": {
            "r": 12303043361969813321008510595799352303777626167191077212436720864556362175001n,
            "s": 44287248520848853208449965274039658906134850867725872574460252467151437608065n,
          },
          "type": "webAuthn",
        },
        "type": "keychain",
        "userAddress": "0xc3Cf8B814B729A1ad648b49fbBdED3767BCd35fd",
      }
    `)
  })
})

describe('fromWebCryptoP256', () => {
  test('default', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)
    expect(account.keyType).toBe('p256')
  })

  test('behavior: access key', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const rootAccount = Account.fromSecp256k1(privateKey_secp256k1)
    const account = Account.fromWebCryptoP256(keyPair, { access: rootAccount })
    expect(account.keyType).toBe('p256')
    expect(account.source).toBe('accessKey')
    expect(account.address).toBe(rootAccount.address)
  })
})

describe('signMessage', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const signature = await account.signMessage({ message: 'hello world' })
    expect(signature).toMatchInlineSnapshot(
      `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
    )

    expect(
      await verifyMessage(client, {
        address: account.address,
        message: 'hello world',
        signature,
      }),
    ).toBe(true)
  })

  test('behavior: p256', async () => {
    const account = Account.fromP256(privateKey_p256)
    const signature = await account.signMessage({ message: 'hello world' })
    expect(signature).toMatchInlineSnapshot(
      `"0x019e8afd9a5a2a6034a89d1dc09d6351eb83a3bcf3ee55e55973959c3b90b8103726f0de082476045ec872c42efb27ef2159a848df1d5c8326f3ad14dcfd00653220fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240007777777777777777777777777777777777777777777777777777777777777777"`,
    )

    expect(
      await verifyMessage(client, {
        address: account.address,
        message: 'hello world',
        signature,
      }),
    ).toBe(true)
  })

  test('behavior: webAuthn', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      rpId: 'localhost',
      origin: 'http://localhost',
    })
    const signature = await account.signMessage({ message: 'hello world' })
    expect(signature).toMatchInlineSnapshot(
      `"0x0249960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d976305000000007b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a223265756862744473726b4d72636634416a4a6a4d687975307a43464e4d69436a627a5a544a732d41665767222c226f726967696e223a22687474703a2f2f6c6f63616c686f7374222c2263726f73734f726967696e223a66616c73657d465aa5cd2f5155792a3d5585c059bfacbca733664436aac190c6d2f6c8cd76156a519c9ece3e757a075423f12f87b0dbbb536e158e4b19e6ac94bcc59330843720fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c8122407777777777777777777777777777777777777777777777777777777777777777"`,
    )

    expect(
      await verifyMessage(client, {
        address: account.address,
        message: 'hello world',
        signature,
      }),
    ).toBe(true)
  })
})

describe('signTransaction', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const serialized = await account.signTransaction({
      chainId: 1,
      maxFeePerGas: parseGwei('10'),
      to: '0x0000000000000000000000000000000000000001',
      value: 0n,
    })
    expect(serialized).toBeDefined()
    expect(typeof serialized).toBe('string')
  })

  test('behavior: p256', async () => {
    const account = Account.fromP256(privateKey_p256)
    const serialized = await account.signTransaction({
      chainId: 1,
      calls: [],
      maxFeePerGas: parseGwei('10'),
      to: '0x0000000000000000000000000000000000000001',
      value: 0n,
    })
    expect(serialized).toMatchInlineSnapshot(
      `"0x76f8ae01808502540be40080d8d79400000000000000000000000000000000000000018080c0808080808080c0b88201a634e2f5952b461e0818ce86067736d5ce18a61e50ebf6211eca327b9c30802571b7a01eb9ca00481fca589e9682ff9acb5b496315a738ecdd9d5491ff46d6b420fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c81224000"`,
    )
  })

  test('behavior: webAuthn', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      rpId: 'localhost',
      origin: 'http://localhost',
    })
    const serialized = await account.signTransaction({
      chainId: 1,
      calls: [],
      maxFeePerGas: parseGwei('10'),
      to: '0x0000000000000000000000000000000000000001',
      value: 0n,
    })
    expect(serialized).toMatchInlineSnapshot(
      `"0x76f9015401808502540be40080d8d79400000000000000000000000000000000000000018080c0808080808080c0b901270249960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d976305000000007b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2247394b526f3462364a4336446d4e596241477847514e42373962356a6d41425f486a6e364e562d7a5f3851222c226f726967696e223a22687474703a2f2f6c6f63616c686f7374222c2263726f73734f726967696e223a66616c73657d8825fcab1b36bd74f6171f6a02698f8a3f7c4494005ed58c10526fe292e7583f2421e978ad3f70421e98a22e5c0b940d483793eeb1ba0e0556a1650ebced6ae520fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240"`,
    )
  })
})

describe('signTypedData', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const signature = await account.signTypedData({
      domain: {
        name: 'Test',
        version: '1',
        chainId: 1,
      },
      types: {
        Test: [{ name: 'value', type: 'string' }],
      },
      primaryType: 'Test',
      message: { value: 'hello' },
    })
    expect(signature).toMatchInlineSnapshot(
      `"0xb8952a54215f98f3de2cba7d2dda7587f46654b1622963b44c81e8907bae7ef866af78c1e27e54ef46b04ae2bf5d513b72e6f59944e46a54104348010af170251c"`,
    )

    expect(
      await verifyTypedData(client, {
        address: account.address,
        domain: {
          name: 'Test',
          version: '1',
          chainId: 1,
        },
        types: {
          Test: [{ name: 'value', type: 'string' }],
        },
        primaryType: 'Test',
        message: { value: 'hello' },
        signature,
      }),
    ).toBe(true)
  })

  test('behavior: p256', async () => {
    const account = Account.fromP256(privateKey_p256)
    const signature = await account.signTypedData({
      domain: {
        name: 'Test',
        version: '1',
        chainId: 1,
      },
      types: {
        Test: [{ name: 'value', type: 'string' }],
      },
      primaryType: 'Test',
      message: { value: 'hello' },
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x01d0e4eba4b8715e90b17d6fae63521ec4f51e119c4f3857ed04120bebc19f61d411606f5b07163c071f4c5e553b9b88ec5d8e0a31c9c3a7472af0b4c3e1bd4c2420fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240007777777777777777777777777777777777777777777777777777777777777777"`,
    )

    expect(
      await verifyTypedData(client, {
        address: account.address,
        domain: {
          name: 'Test',
          version: '1',
          chainId: 1,
        },
        types: {
          Test: [{ name: 'value', type: 'string' }],
        },
        primaryType: 'Test',
        message: { value: 'hello' },
        signature,
      }),
    ).toBe(true)
  })

  test('behavior: webAuthn', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      rpId: 'localhost',
      origin: 'http://localhost',
    })
    const signature = await account.signTypedData({
      domain: {
        name: 'Test',
        version: '1',
        chainId: 1,
      },
      types: {
        Test: [{ name: 'value', type: 'string' }],
      },
      primaryType: 'Test',
      message: { value: 'hello' },
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x0249960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d976305000000007b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2255444b505432495376767437546f35656436695a70346869485f364c4e6d3570446851646e7878654b5741222c226f726967696e223a22687474703a2f2f6c6f63616c686f7374222c2263726f73734f726967696e223a66616c73657d497b47c010ed378fca3ffba3939edce1a61d994fa0e83c473ef976c9527492f554003f6e898d2b1986aeb8e1731d622d6501f65d09bdefb70d2f72849580ddb020fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c8122407777777777777777777777777777777777777777777777777777777777777777"`,
    )

    expect(
      await verifyTypedData(client, {
        address: account.address,
        domain: {
          name: 'Test',
          version: '1',
          chainId: 1,
        },
        types: {
          Test: [{ name: 'value', type: 'string' }],
        },
        primaryType: 'Test',
        message: { value: 'hello' },
        signature,
      }),
    ).toBe(true)
  })
})

describe('signAuthorization', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const authorization = await account.signAuthorization({
      address: '0x0000000000000000000000000000000000000001',
      chainId: 1,
      nonce: 0,
    })
    expect(authorization).toMatchInlineSnapshot(`
      {
        "address": "0x0000000000000000000000000000000000000001",
        "chainId": 1,
        "nonce": 0,
        "r": "0x362e961de7bc54dda5fbf6e65a43534f16003a9b9fcd8b32cd1cfa0f78aad683",
        "s": "0x0f7f9257e143adec1e2035e0b2fa19bc5df8946c4bf7f08da47331a413ff9eeb",
        "yParity": 1,
      }
    `)
  })

  test('behavior: contractAddress', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const authorization = await account.signAuthorization({
      contractAddress: '0x0000000000000000000000000000000000000002',
      chainId: 1,
      nonce: 0,
    })
    expect(authorization.address).toBe(
      '0x0000000000000000000000000000000000000002',
    )
  })

  test('error: non-secp256k1', async () => {
    const account = Account.fromP256(privateKey_p256)
    await expect(
      account.signAuthorization({
        address: '0x0000000000000000000000000000000000000001',
        chainId: 1,
        nonce: 0,
      }),
    ).rejects.toThrow('Unsupported signature type. Expected `secp256k1`')
  })
})

describe('signKeyAuthorization', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const key = Account.fromSecp256k1(privateKey_secp256k1, {
      access: account,
    })

    const authorization = await account.signKeyAuthorization(key)

    expect(authorization).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "expiry": undefined,
        "limits": undefined,
        "signature": {
          "signature": {
            "r": 79205852917725370379355270588870592116219723320468023492479334723587833964208n,
            "s": 4843127791679253574310716587415423223041264865988930666086461408483250881493n,
            "yParity": 1,
          },
          "type": "secp256k1",
        },
        "type": "secp256k1",
      }
    `)
  })

  test('secp256k1', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const key = Account.fromSecp256k1(privateKey_secp256k1, {
      access: account,
    })

    const authorization = await account.signKeyAuthorization(key, {
      expiry: 1234567890,
      limits: [
        {
          token: '0x20c0000000000000000000000000000000000001',
          limit: Value.from('10', 6),
        },
      ],
    })
    expect(authorization).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "expiry": 1234567890,
        "limits": [
          {
            "limit": 10000000n,
            "token": "0x20c0000000000000000000000000000000000001",
          },
        ],
        "signature": {
          "signature": {
            "r": 48603032183460068649726257603541287031240449157747147951793434940348798421977n,
            "s": 52252948283033674801195452183159160801795536276956563866652050470169279213377n,
            "yParity": 1,
          },
          "type": "secp256k1",
        },
        "type": "secp256k1",
      }
    `)
  })

  test('p256', async () => {
    const account = Account.fromP256(privateKey_p256)
    const key = Account.fromSecp256k1(privateKey_p256, {
      access: account,
    })

    const authorization = await account.signKeyAuthorization(key, {
      expiry: 1234567890,
      limits: [
        {
          token: '0x20c0000000000000000000000000000000000001',
          limit: Value.from('10', 6),
        },
      ],
    })
    expect(authorization).toMatchInlineSnapshot(`
      {
        "address": "0x7b9f73245dee5855ef858f5c00eea6205f9bb4d2",
        "expiry": 1234567890,
        "limits": [
          {
            "limit": 10000000n,
            "token": "0x20c0000000000000000000000000000000000001",
          },
        ],
        "signature": {
          "prehash": false,
          "publicKey": {
            "prefix": 4,
            "x": 14922859167660714031319135249406228569331107293314503672038378501577989797848n,
            "y": 57892587925019714505251703757706314187537979987563648366993255393643804566080n,
          },
          "signature": {
            "r": 61783347383434217927888325272237644430195567463134160594444735116547420206984n,
            "s": 11737632122119624918549121055165681708107124199303685870565323985056705147576n,
          },
          "type": "p256",
        },
        "type": "secp256k1",
      }
    `)
  })

  test('webAuthn', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      rpId: 'localhost',
      origin: 'http://localhost',
    })
    const key = Account.fromSecp256k1(privateKey_secp256k1, {
      access: account,
    })

    const authorization = await account.signKeyAuthorization(key, {
      expiry: 1234567890,
      limits: [
        {
          token: '0x20c0000000000000000000000000000000000001',
          limit: Value.from('10', 6),
        },
      ],
    })
    expect(authorization).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "expiry": 1234567890,
        "limits": [
          {
            "limit": 10000000n,
            "token": "0x20c0000000000000000000000000000000000001",
          },
        ],
        "signature": {
          "metadata": {
            "authenticatorData": "0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000",
            "clientDataJSON": "{"type":"webauthn.get","challenge":"lGAMxkLdccXnNTMWbfQ1rYi8HBqAdMPo1CDv0cJ2IsE","origin":"http://localhost","crossOrigin":false}",
          },
          "publicKey": {
            "prefix": 4,
            "x": 14922859167660714031319135249406228569331107293314503672038378501577989797848n,
            "y": 57892587925019714505251703757706314187537979987563648366993255393643804566080n,
          },
          "signature": {
            "r": 78216200649325922174765550266136727201161525335688064274452437990389629688142n,
            "s": 45615041673857220498429503388722739621903077428603741554126666038202271956449n,
          },
          "type": "webAuthn",
        },
        "type": "secp256k1",
      }
    `)
  })

  test('multiple limits', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const key = Account.fromSecp256k1(privateKey_secp256k1, {
      access: account,
    })

    const authorization = await account.signKeyAuthorization(key, {
      expiry: 1234567890,
      limits: [
        {
          token: '0x20c0000000000000000000000000000000000001',
          limit: Value.from('10', 6),
        },
        {
          token: '0x20c0000000000000000000000000000000000002',
          limit: Value.from('20', 6),
        },
      ],
    })
    expect(authorization).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "expiry": 1234567890,
        "limits": [
          {
            "limit": 10000000n,
            "token": "0x20c0000000000000000000000000000000000001",
          },
          {
            "limit": 20000000n,
            "token": "0x20c0000000000000000000000000000000000002",
          },
        ],
        "signature": {
          "signature": {
            "r": 103446563773805832555738463837136311499830712555215862064308154410957015968940n,
            "s": 19247215858016211284757060583528935834485291841858715669623661689922072500812n,
            "yParity": 0,
          },
          "type": "secp256k1",
        },
        "type": "secp256k1",
      }
    `)
  })
})

describe('signKeyAuthorization (standalone)', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey_secp256k1)
    const key = Account.fromSecp256k1(privateKey_secp256k1, {
      access: account,
    })

    const authorization = await Account.signKeyAuthorization(account, {
      key,
      expiry: 1234567890,
      limits: [
        {
          token: '0x20c0000000000000000000000000000000000001',
          limit: Value.from('10', 6),
        },
      ],
    })
    expect(authorization).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "expiry": 1234567890,
        "limits": [
          {
            "limit": 10000000n,
            "token": "0x20c0000000000000000000000000000000000001",
          },
        ],
        "signature": {
          "signature": {
            "r": 48603032183460068649726257603541287031240449157747147951793434940348798421977n,
            "s": 52252948283033674801195452183159160801795536276956563866652050470169279213377n,
            "yParity": 1,
          },
          "type": "secp256k1",
        },
        "type": "secp256k1",
      }
    `)
  })
})
