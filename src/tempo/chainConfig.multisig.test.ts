import { MultisigConfig } from 'ox/tempo'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { prepareTransactionRequest } from '../actions/index.js'
import * as Account from './Account.js'

const client = getClient({
  account: accounts.at(0)!,
})

describe('prepareTransactionRequest', () => {
  test('behavior: derives a multisig witness', async () => {
    const config = MultisigConfig.from({
      owners: [
        { owner: accounts[1].address, weight: 1 },
        { owner: accounts[2].address, weight: 1 },
        { owner: accounts[3].address, weight: 1 },
      ],
      threshold: 2,
    })

    const request = await prepareTransactionRequest(client, {
      multisig: config,
      parameters: ['chainId'],
    })

    expect(request.multisigWitness).toMatchInlineSnapshot(`
      {
        "account": "0x75dc015f090b457fc7615fa37859937d1906e1c9",
        "approvals": [
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
            "type": "primitive",
          },
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
            "type": "primitive",
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
    const config = MultisigConfig.from({
      owners: [
        { owner: accounts[1].address, weight: 1 },
        { owner: accounts[2].address, weight: 2 },
        { owner: accounts[3].address, weight: 1 },
      ],
      threshold: 2,
    })

    const request = await prepareTransactionRequest(client, {
      multisig: config,
      parameters: ['chainId'],
    })

    expect(request.multisigWitness?.approvals).toMatchInlineSnapshot(`
      [
        {
          "keyData": "0x0578",
          "keyType": "webAuthn",
          "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
          "type": "primitive",
        },
      ]
    `)
  })

  test('behavior: preserves a current config witness', async () => {
    const initial = MultisigConfig.from({
      owners: [{ owner: accounts[1].address, weight: 1 }],
      threshold: 1,
    })
    const account = Account.fromMultisig({
      address: MultisigConfig.getAddress(initial),
      ...initial,
      version: 2n,
    })

    const request = await prepareTransactionRequest(client, {
      multisig: account,
      parameters: ['chainId'],
    })

    expect(request.multisigWitness).toMatchInlineSnapshot(`
      {
        "account": "0xC3E0021dFCe214618C347C68f665dF085C4295F8",
        "approvals": [
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
            "type": "primitive",
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
