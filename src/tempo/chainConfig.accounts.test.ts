import { AccountConfig, KeyAuthorization, SignatureEnvelope } from 'ox/tempo'
import { Account as CoreAccount, Actions as viem_Actions } from 'viem'
import { Account, Actions } from 'viem/tempo'
import { Hex, Secp256k1, Signature } from 'viem/utils'
import { describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempoAccounts.js'
import type { TransactionRequest } from './chainConfig.js'

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

    const request = (
      await viem_Actions.transaction.prepare(client, {
        account: Account.fromConfig({ address: 'infer', ...config }),
        parameters: ['chainId'],
      })
    ).request

    expect((request as TransactionRequest).accountSimulation)
      .toMatchInlineSnapshot(`
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

    const request = (
      await viem_Actions.transaction.prepare(client, {
        account: Account.fromConfig({ address: 'infer', ...config }),
        parameters: ['chainId'],
      })
    ).request

    expect((request as TransactionRequest).accountSimulation?.approvals)
      .toMatchInlineSnapshot(`
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

    const request = (
      await viem_Actions.transaction.prepare(client, {
        account,
        parameters: ['chainId'],
      })
    ).request

    expect((request as TransactionRequest).accountSimulation)
      .toMatchInlineSnapshot(`
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

    const { request } = await viem_Actions.transaction.prepare(client, {
      account: accessKey,
      parameters: ['chainId'],
    })

    expect((request as TransactionRequest).accountSimulation)
      .toMatchInlineSnapshot(`
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
      salt: Hex.fromNumber(0x111201, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(Secp256k1.randomPrivateKey(), {
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
    const keyAuthorization = (approvals: readonly Account.RootAccount[]) =>
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
        } as KeyAuthorization.Signed),
      )

    const { request: pending } = await viem_Actions.transaction.prepare(
      client,
      {
        account: accessKey,
        calls: [{ to: accounts[3].address }],
        feeToken,
        keyAuthorization: await keyAuthorization([owner_1]),
      },
    )
    expect(pending.gas).toBeGreaterThan(0n)
    expect((pending as TransactionRequest).keyAuthorizationSimulation)
      .toMatchInlineSnapshot(`
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

    const { request: approved } = await viem_Actions.transaction.prepare(
      client,
      {
        account: accessKey,
        calls: [{ to: accounts[3].address }],
        feeToken,
        keyAuthorization: await keyAuthorization([owner_1, owner_2]),
      },
    )
    expect(
      (approved as TransactionRequest).keyAuthorizationSimulation,
    ).toBeUndefined()
  })

  test('error: rejects a generic local owner account', async () => {
    const owner = CoreAccount.fromPrivateKey(Secp256k1.randomPrivateKey())
    const config = AccountConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    })

    await expect(
      viem_Actions.transaction.prepare(client, {
        account: Account.fromConfig({ address: 'infer', ...config }),
        owner,
        parameters: ['chainId'],
      } as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: A Tempo owner account is required to approve a configurable account transaction.]`,
    )
  })
})
