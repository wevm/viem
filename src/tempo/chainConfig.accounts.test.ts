import { Signature } from 'ox'
import { AccountConfig, KeyAuthorization, SignatureEnvelope } from 'ox/tempo'
import { hashMessage, hexToBytes, parseSignature, toHex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  prepareTransactionRequest,
  verifyHash,
  verifyMessage,
} from 'viem/actions'
import { createSiweMessage, verifySiweMessage } from 'viem/siwe'
import { Account, Actions, P256 } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import type { RootAccount } from './Account.js'

const client = getClient({
  account: accounts.at(0)!,
})

describe('prepareTransactionRequest', () => {
  test('behavior: derives a account simulation', async () => {
    const config = AccountConfig.from({
      owners: [
        { owner: accounts[1].address, weight: 1 },
        { owner: accounts[2].address, weight: 1 },
        { owner: accounts[3].address, weight: 1 },
      ],
      threshold: 2,
    })

    const request = await prepareTransactionRequest(client, {
      account: Account.fromConfig({ address: 'infer', ...config }),
      parameters: ['chainId'],
    })

    expect(request.accountSimulation).toMatchInlineSnapshot(`
      {
        "approvals": [
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
          },
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
          },
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
              "weight": 1,
            },
            {
              "owner": "0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
          "version": 0n,
        },
      }
    `)
  })

  test('behavior: selects a deterministic weighted quorum', async () => {
    const config = AccountConfig.from({
      owners: [
        { owner: accounts[1].address, weight: 1 },
        { owner: accounts[2].address, weight: 2 },
        { owner: accounts[3].address, weight: 1 },
      ],
      threshold: 2,
    })

    const request = await prepareTransactionRequest(client, {
      account: Account.fromConfig({ address: 'infer', ...config }),
      parameters: ['chainId'],
    })

    expect(request.accountSimulation?.approvals).toMatchInlineSnapshot(`
      [
        {
          "keyData": "0x0578",
          "keyType": "webAuthn",
          "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
        },
      ]
    `)
  })

  test('behavior: preserves a current config', async () => {
    const initial = AccountConfig.from({
      owners: [{ owner: accounts[1].address, weight: 1 }],
      threshold: 1,
    })
    const account = Account.fromConfig({
      address: AccountConfig.getAddress(initial),
      ...initial,
      version: 2n,
    })

    const request = await prepareTransactionRequest(client, {
      account,
      parameters: ['chainId'],
    })

    expect(request.accountSimulation).toMatchInlineSnapshot(`
      {
        "approvals": [
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
          },
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 1,
          "version": 2n,
        },
      }
    `)
  })

  test('behavior: simulates a configurable access key', async () => {
    const accessKey = Account.fromConfig(
      {
        owners: [accounts[1], accounts[2].address],
        threshold: 2,
      },
      { access: accounts[0] },
    )

    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      parameters: ['chainId'],
    })

    expect(request.accountSimulation).toMatchInlineSnapshot(`
      {
        "approvals": [
          {
            "keyType": "secp256k1",
            "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
          },
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
          },
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
          "version": 0n,
        },
        "signer": "0x6A5177760374661B6fb3Dd8445715b2ff417bc8d",
      }
    `)
  })

  test('behavior: simulates a key authorization below its quorum', async () => {
    const owner_1 = accounts[1]
    const owner_2 = accounts[2]
    const parent = Account.fromConfig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x111201, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: parent,
    })
    await Actions.token.transferSync(client, {
      amount: { formatted: '100' },
      to: parent.address,
      token: feeToken,
    })

    const authorization = await Actions.accessKey.prepareAuthorization(client, {
      account: parent,
      accessKey,
    })
    const keyAuthorization = (approvals: readonly RootAccount[]) =>
      Promise.all(
        approvals.map((owner) =>
          owner.sign({ hash: authorization.signPayload }),
        ),
      ).then((signatures) =>
        KeyAuthorization.from({
          account: parent.address,
          address: accessKey.accessKeyAddress,
          chainId: BigInt(client.chain.id),
          signature: SignatureEnvelope.from({
            account: parent.address,
            config: parent.config,
            signatures: signatures.map((signature) => ({
              signature: Signature.from(signature),
              type: 'secp256k1' as const,
            })),
          }),
          type: 'secp256k1',
        } as never),
      )

    const pending = await prepareTransactionRequest(client, {
      account: accessKey,
      calls: [{ to: accounts[3].address }],
      feeToken,
      keyAuthorization: await keyAuthorization([owner_1]),
    })
    expect(pending.gas).toBeGreaterThan(0n)
    expect(pending.keyAuthorizationSimulation).toMatchInlineSnapshot(`
      {
        "approvals": [
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
          },
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
          },
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000111201",
          "threshold": 2,
          "version": 0n,
        },
        "signer": "0x099645877A63e30615684e184ba55a2AF86D890c",
      }
    `)

    const approved = await prepareTransactionRequest(client, {
      account: accessKey,
      calls: [{ to: accounts[3].address }],
      feeToken,
      keyAuthorization: await keyAuthorization([owner_1, owner_2]),
    })
    expect(approved.keyAuthorizationSimulation).toBeUndefined()
  })

  test('behavior: rejects nested account simulation', () => {
    const child = Account.fromConfig({ owners: [accounts[1]] })
    // @ts-expect-error Verify runtime rejection for untyped callers.
    expect(() => Account.fromConfig({ owners: [child] })).toThrow(
      'Configurable account owners must use primitive signatures.',
    )
  })

  test('error: rejects a generic local owner account', async () => {
    const owner = privateKeyToAccount(generatePrivateKey())
    const config = AccountConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    })

    await expect(
      prepareTransactionRequest(client, {
        account: Account.fromConfig({ address: 'infer', ...config }),
        owner,
        parameters: ['chainId'],
      } as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: A Tempo owner account is required to approve a configurable account transaction.]`,
    )
  })
})

describe('verifyHash', () => {
  const hash = hashMessage('hello world')

  /** Commits a config for the account, which retires its root key (TIP-1113). */
  async function retire(root: RootAccount) {
    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '100' },
      to: root.address,
      token: feeToken,
    })
    await Actions.accounts.upgradeSync(client, {
      account: root,
      feeToken,
      owners: [{ owner: accounts[1].address, weight: 1 }],
      threshold: 1,
    })
  }

  test('behavior: rejects a retired secp256k1 root key', async () => {
    const root = Account.fromSecp256k1(generatePrivateKey())
    const { address } = root
    const signature = await root.sign({ hash })
    const message = createSiweMessage({
      address,
      chainId: client.chain.id,
      domain: 'example.com',
      nonce: 'foobarbaz',
      uri: 'https://example.com/path',
      version: '1',
    })
    const siweSignature = await root.signMessage({ message })
    const verify = async () => ({
      allowAccessKey: await verifyHash(client, {
        address,
        hash,
        mode: 'allowAccessKey',
        signature,
      }),
      auto: await verifyHash(client, { address, hash, signature }),
      bytes: await verifyHash(client, {
        address,
        hash,
        mode: 'eoa',
        signature: hexToBytes(signature),
      }),
      eoa: await verifyHash(client, { address, hash, mode: 'eoa', signature }),
      object: await verifyHash(client, {
        address,
        hash,
        signature: parseSignature(signature),
      }),
      verifyMessage: await verifyMessage(client, {
        address,
        message: 'hello world',
        signature,
      }),
      verifySiweMessage: await verifySiweMessage(client, {
        message,
        signature: siweSignature,
      }),
    })

    const active = await verify()
    await retire(root)
    const retired = await verify()

    expect({ active, retired }).toMatchInlineSnapshot(`
      {
        "active": {
          "allowAccessKey": true,
          "auto": true,
          "bytes": true,
          "eoa": true,
          "object": true,
          "verifyMessage": true,
          "verifySiweMessage": true,
        },
        "retired": {
          "allowAccessKey": false,
          "auto": false,
          "bytes": false,
          "eoa": false,
          "object": false,
          "verifyMessage": false,
          "verifySiweMessage": false,
        },
      }
    `)
  })

  test.each([
    { name: 'p256', root: Account.fromP256(P256.randomPrivateKey()) },
    {
      name: 'webAuthn',
      root: Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
        origin: 'https://example.com',
        rpId: 'example.com',
      }),
    },
  ])('behavior: rejects a retired $name root key', async ({ root }) => {
    const { address } = root
    const signature = await root.sign({ hash })
    const verify = async () => ({
      allowAccessKey: await verifyHash(client, {
        address,
        hash,
        mode: 'allowAccessKey',
        signature,
      }),
      auto: await verifyHash(client, { address, hash, signature }),
      eoa: await verifyHash(client, { address, hash, mode: 'eoa', signature }),
    })

    const active = await verify()
    await retire(root)
    const retired = await verify()

    expect({ active, retired }).toMatchInlineSnapshot(`
      {
        "active": {
          "allowAccessKey": true,
          "auto": true,
          "eoa": true,
        },
        "retired": {
          "allowAccessKey": false,
          "auto": false,
          "eoa": false,
        },
      }
    `)
  })
})
