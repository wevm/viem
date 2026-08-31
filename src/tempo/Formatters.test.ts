import { KeyAuthorization, MultisigConfig, SignatureEnvelope } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import {
  estimateGas,
  getTransaction,
  sendTransactionSync,
} from '../actions/index.js'
import * as Account from './Account.js'
import * as Formatters from './Formatters.js'

const client = getClient({
  account: accounts.at(0)!,
})

describe('formatTransaction', () => {
  test('behavior: multisig RPC signatures', () => {
    const transaction = Formatters.formatTransaction({
      accessList: [],
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: '0x12f296f',
      calls: [],
      chainId: '0x1',
      feeToken: '0x20c0000000000000000000000000000000000000',
      from: '0xc4a590afa7337e5cd5eb3aa60cacf91c5400044b',
      gas: '0x43f5d',
      hash: '0x353fdfc38a2f26115daadee9f5b8392ce62b84f410957967e2ed56b35338cdd0',
      keyAuthorization: {
        chainId: '0x1',
        expiry: null,
        keyId: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
        keyType: 'secp256k1',
        signature:
          '0xf89794be95c3f554e9fc85ec51be69a3d807a0d55bcf2cf83ba000000000000000000000000000000000000000000000000000000000000000000101d7d694f39fd6e51aad88f6f4ce6ab8827279cfffb9226601f843b841fa78c5905fb0b9d6066ef531f962a62bc6ef0d5eb59ecb134056d206f75aaed7780926ff2601a935c2c79707d9e1799948c9f19dcdde1e090e903b19a07923d01c',
      },
      maxFeePerGas: '0x2',
      maxPriorityFeePerGas: '0x1',
      nonce: '0x357',
      signature:
        '0xf89794c4a590afa7337e5cd5eb3aa60cacf91c5400044bf83ba000000000000000000000000000000000000000000000000000000000000000008001d7d6947e5f4552091a69125d5dfcb7b8c2659029395bdf01f843b841869437e01f64bebeb78a8a6b30bfd3a993819c8cad82c807515d9b9e9b36f98535dfaa5eebc597715d05f6ce4927747f14fa4cd2acc717fdcd3877146437f8f41b',
      transactionIndex: '0x2',
      type: '0x76',
    } as never)

    expect(transaction.signature).toMatchInlineSnapshot(`
      {
        "account": "0xc4a590afa7337e5cd5eb3aa60cacf91c5400044b",
        "config": {
          "owners": [
            {
              "owner": "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 1,
          "version": 0n,
        },
        "signatures": [
          {
            "signature": {
              "r": 60871800714128149016591846789173983752390955456021923556141688418770269698437n,
              "s": 24367763726302312398084372528434045669788111037623467391175388828437596076276n,
              "yParity": 0,
            },
            "type": "secp256k1",
          },
        ],
        "type": "multisig",
      }
    `)
    expect(transaction.keyAuthorization?.signature).toMatchInlineSnapshot(`
      {
        "account": "0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c",
        "config": {
          "owners": [
            {
              "owner": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 1,
          "version": 1n,
        },
        "signatures": [
          {
            "signature": {
              "r": 113291597329930009559670063131885256927775966057121513567941051428123344285399n,
              "s": 54293712598725100598138577281441749550405991478212695085505730636505228583888n,
              "yParity": 1,
            },
            "type": "secp256k1",
          },
        ],
        "type": "multisig",
      }
    `)
  })

  test('behavior: non-tempo transaction', async () => {
    const receipt = await sendTransactionSync(client, {
      to: '0x0000000000000000000000000000000000000000',
    })
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.type).not.toBe('tempo')
  })

  test('behavior: tempo transaction', async () => {
    const feePayerClient = getClient({
      account: accounts.at(1)!,
    })
    const receipt = await sendTransactionSync(feePayerClient, {
      to: '0x0000000000000000000000000000000000000000',
      feePayer: accounts.at(0)!,
    })
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.type).toBe('tempo')
  })
})

describe('formatTransactionRequest', () => {
  test('behavior: multisig simulation', () => {
    const rpc = Formatters.formatTransactionRequest({
      multisigSimulation: {
        account: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        approvals: [
          {
            keyType: 'secp256k1',
            owner: '0x1111111111111111111111111111111111111111',
            type: 'primitive',
          },
          {
            spec: {
              account: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
              approvals: [
                {
                  keyData: '0x0578',
                  keyType: 'webAuthn',
                  owner: '0x2222222222222222222222222222222222222222',
                },
              ],
              config: MultisigConfig.from({
                owners: [
                  {
                    owner: '0x2222222222222222222222222222222222222222',
                    weight: 1,
                  },
                ],
                salt: `0x${'22'.repeat(32)}`,
                threshold: 1,
                version: 1,
              }),
            },
            type: 'multisig',
          },
        ],
        config: MultisigConfig.from({
          owners: [
            {
              owner: '0x1111111111111111111111111111111111111111',
              weight: 1,
            },
            {
              owner: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
              weight: 1,
            },
          ],
          salt: `0x${'11'.repeat(32)}`,
          threshold: 2,
        }),
      },
    } as never)

    expect(rpc.multisigSimulation).toMatchInlineSnapshot(`
      {
        "account": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "approvals": [
          {
            "keyType": "secp256k1",
            "owner": "0x1111111111111111111111111111111111111111",
            "type": "primitive",
          },
          {
            "spec": {
              "account": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
              "approvals": [
                {
                  "keyData": "0x0578",
                  "keyType": "webAuthn",
                  "owner": "0x2222222222222222222222222222222222222222",
                },
              ],
              "config": "0xf83ba022222222222222222222222222222222222222222222222222222222222222220101d7d694222222222222222222222222222222222222222201",
            },
            "type": "multisig",
          },
        ],
        "config": "0xf852a011111111111111111111111111111111111111111111111111111111111111118002eed694111111111111111111111111111111111111111101d694bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01",
      }
    `)
  })

  test('behavior: webAuthn account populates keyType and keyData', async () => {
    const webAuthnAccount = Account.fromHeadlessWebAuthn(
      '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28',
      {
        rpId: 'localhost',
        origin: 'http://localhost',
      },
    )
    const webAuthnClient = getClient({
      account: webAuthnAccount,
    })
    const gas = await estimateGas(webAuthnClient, {
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(gas).toBeGreaterThan(0n)
  })

  test('behavior: p256 account populates keyType', async () => {
    const p256Account = Account.fromP256(
      '0x5c878151adef73f88b1c360d33e9bf9dd1b6e2e0e07bc555fc33cb8cf6bc9b28',
    )
    const p256Client = getClient({
      account: p256Account,
    })
    const gas = await estimateGas(p256Client, {
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(gas).toBeGreaterThan(0n)
  })

  test('behavior: estimateGas action clears fee fields', async () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxFeePerGas: 1000n,
        maxPriorityFeePerGas: 100n,
      } as never,
      'estimateGas',
    )
    expect(rpc.maxFeePerGas).toBeUndefined()
    expect(rpc.maxPriorityFeePerGas).toBeUndefined()
  })

  test('error: JSON-RPC multisig owner', () => {
    const config = MultisigConfig.from({
      owners: [{ owner: accounts[1].address, weight: 1 }],
      threshold: 1,
    })
    expect(() =>
      Formatters.formatTransactionRequest({
        account: Account.fromMultisig({ address: 'infer', ...config }),
        calls: [{ data: '0xdeadbeef', to: accounts[2].address }],
        chainId: 1,
        owner: accounts[1].address,
      } as never),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: A local owner account is required to approve a multisig transaction.]`,
    )
  })

  test('behavior: multisig key authorization', () => {
    const initialConfig = MultisigConfig.from({
      threshold: 1,
      owners: [{ owner: accounts[1].address, weight: 1 }],
    })
    const account = MultisigConfig.getAddress(initialConfig)
    const signature = SignatureEnvelope.from({
      account,
      config: initialConfig,
      signatures: [
        SignatureEnvelope.from({
          r: 1n,
          s: 1n,
          yParity: 0,
        }),
      ],
    })
    const keyAuthorization = KeyAuthorization.from(
      {
        account,
        address: accounts[2].address,
        chainId: 1n,
        isAdmin: false,
        type: 'secp256k1',
      },
      { signature },
    )

    const rpc = Formatters.formatTransactionRequest({
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      chainId: 1,
      keyAuthorization,
    } as never)

    expect(rpc.keyAuthorization?.account).toBe(account)
    expect(rpc.keyAuthorization?.signature).toMatchInlineSnapshot(
      `"0xf8979413d0ea1c219b3ca583082664961b9e8cd2d8b678f83ba000000000000000000000000000000000000000000000000000000000000000008001d7d6948c8d35429f74ec245f8ef2f4fd1e551cff97d65001f843b841000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000011b"`,
    )
  })

  test('behavior: unknown account source returns no keyType', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      to: '0x0000000000000000000000000000000000000000',
      account: {
        address: '0x0000000000000000000000000000000000000000',
        type: 'local',
        source: 'unknown-source',
      },
    } as never)
    expect((rpc as Record<string, unknown>).keyType).toBeUndefined()
  })

  test('behavior: action without calls uses to/value/data', () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        to: '0x0000000000000000000000000000000000000001',
        value: 100n,
        data: '0xdeadbeef',
        feeToken,
      } as never,
      'sendTransaction',
    )
    expect(rpc.calls).toBeDefined()
    expect(rpc.calls?.[0]?.to).toBe(
      '0x0000000000000000000000000000000000000001',
    )
    expect(rpc.calls?.[0]?.value).toBe('0x64')
    expect(rpc.calls?.[0]?.data).toBe('0xdeadbeef')
  })

  test('behavior: action without `to` and `data` uses zero address', () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        feeToken,
      } as never,
      'sendTransaction',
    )
    expect(rpc.calls?.[0]?.to).toBe(
      '0x0000000000000000000000000000000000000000',
    )
  })

  test('behavior: action without `to`', () => {
    const rpc = Formatters.formatTransactionRequest(
      {
        chainId: 1,
        data: '0xdeadbeef',
        feeToken,
      } as never,
      'sendTransaction',
    )
    expect(rpc.calls?.[0]?.to).toBe(undefined)
  })

  test('behavior: feePayer: true deletes feeToken (no fee payer signature)', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: true,
      feeToken,
    } as never)
    expect((rpc as Record<string, unknown>).feeToken).toBeUndefined()
    expect((rpc as Record<string, unknown>).feePayer).toBe(true)
  })

  test('behavior: feePayer: true preserves feeToken once feePayerSignature is set', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: true,
      feeToken,
      feePayerSignature: {
        r: '0x0000000000000000000000000000000000000000000000000000000000000001',
        s: '0x0000000000000000000000000000000000000000000000000000000000000002',
        yParity: 0,
      },
    } as never)
    expect((rpc as Record<string, unknown>).feeToken).toBe(feeToken)
    expect((rpc as Record<string, unknown>).feePayer).toBe(true)
  })

  test('behavior: keyData >4 bytes is shimmed to length hint', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      keyType: 'webAuthn',
      keyData: `0x${'ff'.repeat(1400)}`,
    } as never)
    // 1400 = 0x0578 → 2-byte BE length hint
    expect((rpc as Record<string, unknown>).keyData).toBe('0x0578')
  })

  test('behavior: keyData ≤4 bytes passes through unchanged', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      keyType: 'webAuthn',
      keyData: '0x0578',
    } as never)
    expect((rpc as Record<string, unknown>).keyData).toBe('0x0578')
  })

  test('behavior: feePayer as object is parsed', () => {
    const rpc = Formatters.formatTransactionRequest({
      chainId: 1,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      feePayer: { address: '0x0000000000000000000000000000000000000001' },
    } as never)
    expect((rpc as Record<string, unknown>).feePayer).toBeDefined()
  })
})
