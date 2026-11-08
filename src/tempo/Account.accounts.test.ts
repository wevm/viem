import { SignatureEnvelope } from 'ox/tempo'
import { Actions as viem_Actions } from 'viem'
import { Account, Actions } from 'viem/tempo'
import { Hex, PersonalMessage, Secp256k1 } from 'viem/utils'
import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempoAccounts.js'
import type { TransactionRequest } from './chainConfig.js'

const client = tempo.getClient()
const { accounts, feeToken } = tempo
const to = '0x0000000000000000000000000000000000000001'
const hashMessage = (message: string) =>
  PersonalMessage.getSignPayload(Hex.fromString(message))

describe('fromConfig (access key)', () => {
  test('default', async () => {
    const parent = accounts[0]
    const accessKey = Account.fromConfig(
      {
        owners: [accounts[2], accounts[3]],
        salt: Hex.fromNumber(0x111101, { size: 32 }),
        threshold: 2,
      },
      { access: parent },
    )

    await Actions.accessKey.authorizeSync(client, {
      account: parent,
      accessKey,
      feeToken,
    })
    const metadata = await Actions.accessKey.getMetadata(client, {
      account: parent.address,
      accessKey,
    })
    expect({
      address: metadata.address,
      isRevoked: metadata.isRevoked,
      keyType: metadata.keyType,
    }).toMatchInlineSnapshot(`
      {
        "address": "0x09955820428827002C2e93aB82F558E380D0D286",
        "isRevoked": false,
        "keyType": "configurable",
      }
    `)

    const receipt = await viem_Actions.transaction.sendSync(client, {
      account: accessKey,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(parent.address.toLowerCase())

    const { signature } = await viem_Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    if (signature?.type !== 'keychain') throw new Error('Expected keychain.')
    if (signature.inner.type !== 'configurable')
      throw new Error('Expected a configurable inner signature.')
    expect({
      account: signature.inner.account,
      approvals: signature.inner.signatures.length,
      userAddress: signature.userAddress,
      version: signature.version,
    }).toMatchInlineSnapshot(`
      {
        "account": "0x09955820428827002c2e93ab82f558e380d0d286",
        "approvals": 2,
        "userAddress": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "version": "v2",
      }
    `)
  })

  test('behavior: same-transaction authorization', async () => {
    const parent = accounts[0]
    const teamConfig = {
      owners: [accounts[5], accounts[6]],
      salt: Hex.fromNumber(0x111102, { size: 32 }),
      threshold: 1,
    }
    const team = Account.fromConfig(teamConfig)
    const accessKey = Account.fromConfig(teamConfig, { access: parent })

    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account: parent,
      accessKey,
    })
    expect({
      address: keyAuthorization.address,
      type: keyAuthorization.type,
    }).toMatchInlineSnapshot(`
      {
        "address": "0xF301102674df2EAF53b2E9DC684b5160ac1B0563",
        "type": "configurable",
      }
    `)

    const { request } = await viem_Actions.transaction.prepare(client, {
      account: accessKey,
      feeToken,
      keyAuthorization,
      to,
      value: 0n,
    })
    expect((request as TransactionRequest).accountSimulation?.signer).toBe(
      team.address,
    )

    const receipt = await viem_Actions.transaction.sendRawSync(client, {
      transaction: await viem_Actions.transaction.sign(client, request),
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(parent.address.toLowerCase())
  })

  test('behavior: attaches its key authorization until the chain registers it', async () => {
    const parent = accounts[0]
    const teamConfig = {
      owners: [accounts[8]],
      salt: Hex.fromNumber(0x111103, { size: 32 }),
    }
    const team = Account.fromConfig(teamConfig)
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account: parent,
      accessKey: { address: team.address, type: 'configurable' },
    })
    const accessKey = Account.fromConfig(teamConfig, {
      access: parent,
      keyAuthorization,
    })

    const { request: first } = await viem_Actions.transaction.prepare(client, {
      account: accessKey,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    expect((first as TransactionRequest).keyAuthorization?.address).toBe(
      team.address,
    )
    const receipt = await viem_Actions.transaction.sendRawSync(client, {
      transaction: await viem_Actions.transaction.sign(client, first),
    })
    expect(receipt.status).toBe('success')

    const { request: second } = await viem_Actions.transaction.prepare(client, {
      account: accessKey,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    expect((second as TransactionRequest).keyAuthorization).toBeUndefined()
  })

  test('behavior: external owner approvals', async () => {
    const parent = accounts[0]
    const owner_external = accounts[11]
    const accessKey = Account.fromConfig(
      {
        owners: [accounts[10], owner_external.address],
        salt: Hex.fromNumber(0x111104, { size: 32 }),
        threshold: 2,
      },
      { access: parent },
    )
    await Actions.accessKey.authorizeSync(client, {
      account: parent,
      accessKey,
      feeToken,
    })

    const { request } = await viem_Actions.transaction.prepare(client, {
      account: accessKey,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    const approval = await viem_Actions.transaction.sign(client, {
      ...request,
      account: owner_external,
    })
    const receipt = await viem_Actions.transaction.sendSync(client, {
      ...request,
      signatures: [approval],
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(parent.address.toLowerCase())
  })

  test('behavior: approvals from address-only owners', async () => {
    const parent = accounts[0]
    const owner_1 = accounts[13]
    const owner_2 = accounts[14]
    const accessKey = Account.fromConfig(
      {
        owners: [owner_1.address, owner_2.address],
        salt: Hex.fromNumber(0x111105, { size: 32 }),
        threshold: 2,
      },
      { access: parent },
    )
    await Actions.accessKey.authorizeSync(client, {
      account: parent,
      accessKey,
      feeToken,
    })

    const { request } = await viem_Actions.transaction.prepare(client, {
      account: accessKey,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        viem_Actions.transaction.sign(client, { ...request, account: owner }),
      ),
    )
    const receipt = await viem_Actions.transaction.sendSync(client, {
      ...request,
      signatures,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(parent.address.toLowerCase())
  })

  test('behavior: verifyHash', async () => {
    const parent = accounts[0]
    const accessKey = Account.fromConfig(
      {
        owners: [accounts[16], accounts[17]],
        salt: Hex.fromNumber(0x111106, { size: 32 }),
        threshold: 2,
      },
      { access: parent },
    )
    await Actions.accessKey.authorizeSync(client, {
      account: parent,
      accessKey,
      feeToken,
    })

    const hash = hashMessage('hello')
    const signature = await accessKey.signMessage({ message: 'hello' })
    const verify = (hash: Hex.Hex) =>
      viem_Actions.verifyHash(client, {
        address: parent.address,
        hash,
        mode: 'allowAccessKey',
        signature,
      })

    expect(SignatureEnvelope.from(signature).type).toBe('keychain')
    expect(await verify(hash)).toBe(true)
    expect(await verify(hashMessage('goodbye'))).toBe(false)

    await Actions.accessKey.revokeSync(client, {
      account: parent,
      accessKey,
      feeToken,
    })
    expect(await verify(hash)).toBe(false)
  })

  test('behavior: verifyHash rejects an unauthorized configurable access key', async () => {
    const parent = accounts[0]
    const accessKey = Account.fromConfig(
      {
        owners: [accounts[19]],
        salt: Hex.fromNumber(0x111107, { size: 32 }),
      },
      { access: parent },
    )

    const hash = hashMessage('hello')
    expect(
      await viem_Actions.verifyHash(client, {
        address: parent.address,
        hash,
        mode: 'allowAccessKey',
        signature: await accessKey.sign({ hash }),
      }),
    ).toBe(false)
  })

  test('behavior: verifyHash rejects a grant of another key type', async () => {
    const parent = accounts[0]
    const teamConfig = {
      owners: [accounts[20]],
      salt: Hex.fromNumber(0x111109, { size: 32 }),
    }
    const team = Account.fromConfig(teamConfig)
    await Actions.accessKey.authorizeSync(client, {
      account: parent,
      accessKey: { address: team.address, type: 'secp256k1' },
      feeToken,
    })
    const accessKey = Account.fromConfig(teamConfig, { access: parent })

    const hash = hashMessage('hello')
    expect(
      await viem_Actions.verifyHash(client, {
        address: parent.address,
        hash,
        mode: 'allowAccessKey',
        signature: await accessKey.sign({ hash }),
      }),
    ).toBe(false)
  })

  test('behavior: verifyHash accepts a migrated delegate whatever key type its grant stores', async () => {
    const parent = accounts[0]
    const privateKey = Secp256k1.randomPrivateKey()
    const root = Account.fromSecp256k1(privateKey)
    const owner = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
    await Actions.token.transferSync(client, {
      account: parent,
      amount: { formatted: '100' },
      to: root.address,
      token: feeToken,
    })
    await Actions.accessKey.authorizeSync(client, {
      account: parent,
      accessKey: { address: root.address, type: 'secp256k1' },
      feeToken,
    })
    await Actions.accounts.upgradeSync(client, {
      account: root,
      feeToken,
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    })
    const hash = hashMessage('hello')
    const verify = async (account: Account.AccessKeyAccount) =>
      viem_Actions.verifyHash(client, {
        address: parent.address,
        hash,
        mode: 'allowAccessKey',
        signature: await account.sign({ hash }),
      })

    expect({
      delegate: await verify(
        Account.fromConfig(
          {
            address: root.address,
            upgrade: { owners: [owner], threshold: 1 },
          },
          { access: parent },
        ),
      ),
      retiredRoot: await verify(
        Account.fromSecp256k1(privateKey, { access: parent }),
      ),
    }).toMatchInlineSnapshot(`
      {
        "delegate": true,
        "retiredRoot": false,
      }
    `)
  })

  test('behavior: verifyHash rejects an inner signature of another key type', async () => {
    const parent = accounts[0]
    const privateKey = Secp256k1.randomPrivateKey()
    const accessKey = Account.fromSecp256k1(privateKey, { access: parent })
    await Actions.accessKey.authorizeSync(client, {
      account: parent,
      accessKey: { address: accessKey.accessKeyAddress, type: 'p256' },
      feeToken,
    })

    const hash = hashMessage('hello')
    expect(
      await viem_Actions.verifyHash(client, {
        address: parent.address,
        hash,
        mode: 'allowAccessKey',
        signature: await accessKey.sign({ hash }),
      }),
    ).toBe(false)
  })

  test('error: owner option', async () => {
    const accessKey = Account.fromConfig(
      { owners: [accounts[13].address], threshold: 1 },
      { access: accounts[0] },
    )

    await expect(
      viem_Actions.transaction.prepare(client, {
        account: accessKey,
        calls: [{ to, value: 0n }],
        feeToken,
        owner: accounts[13],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: A configurable account is required when an owner is provided.]`,
    )
  })
})
