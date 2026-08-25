import { MultisigConfig } from 'ox/tempo'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { prepareTransactionRequest } from '../actions/index.js'

const client = getClient({
  account: accounts.at(0)!,
})

describe('prepareTransactionRequest', () => {
  test('behavior: multisigSignatureCount left for node inference', async () => {
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: accounts[1].address, weight: 1 },
        { owner: accounts[2].address, weight: 1 },
        { owner: accounts[3].address, weight: 1 },
      ],
    })

    const request = await prepareTransactionRequest(client, {
      multisig: config,
      multisigVersion: 0n,
      parameters: ['chainId'],
    })

    expect(request.multisigSignatureCount).toBeUndefined()
  })

  test('behavior: explicit multisigSignatureCount is preserved', async () => {
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: accounts[1].address, weight: 1 },
        { owner: accounts[2].address, weight: 1 },
        { owner: accounts[3].address, weight: 1 },
      ],
    })

    const request = await prepareTransactionRequest(client, {
      multisig: config,
      multisigSignatureCount: 3,
      multisigVersion: 0n,
      parameters: ['chainId'],
    })

    expect(request.multisigSignatureCount).toBe(3)
  })

  test('behavior: explicit multisigVersion is preserved', async () => {
    const config = MultisigConfig.from({
      threshold: 1,
      owners: [{ owner: accounts[1].address, weight: 1 }],
    })

    const request = await prepareTransactionRequest(client, {
      multisig: config,
      multisigVersion: 2n,
      parameters: ['chainId'],
    })

    expect(request.multisigVersion).toBe(2n)
  })

  test('error: rejects a generic local owner account', async () => {
    const owner = privateKeyToAccount(generatePrivateKey())
    const config = MultisigConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    })

    await expect(
      prepareTransactionRequest(client, {
        account: owner,
        multisig: config,
        parameters: ['chainId'],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: A Tempo owner account is required to approve a multisig transaction.]`,
    )
  })
})
