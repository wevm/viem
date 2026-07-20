import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem'
import { Account, MultisigConfig } from 'viem/tempo'

describe('fromMultisig', () => {
  const { accounts, pathUsd } = tempo

  const to = '0x00000000000000000000000000000000000000ff'

  test('flat 2-of-2: init + subsequent', async () => {
    const owner1 = Account.fromSecp256k1(accounts[1].privateKey)
    const owner2 = Account.fromSecp256k1(accounts[2].privateKey)
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner1.address, weight: 1 },
        { owner: owner2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const client = tempo.getClient()
    await Actions.token.transferSync(client, {
      amount: 10_000_000n,
      to: account.address,
      token: pathUsd,
    })

    {
      const { request } = await Actions.transaction.prepare(client, {
        calls: [
          Actions.token.transfer.call(client, {
            amount: 1n,
            to,
            token: pathUsd,
          }),
        ],
        feeToken: pathUsd,
        multisig: config,
      })
      const signatures = await Promise.all(
        [owner1, owner2].map((owner) =>
          Actions.transaction.sign(client, { ...request, account: owner }),
        ),
      )
      const receipt = await Actions.transaction.sendSync(client, {
        ...request,
        account,
        signatures,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())

      const transaction = await Actions.transaction.get(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.signature?.type).toBe('multisig')
      if (transaction.signature?.type !== 'multisig')
        throw new Error('unreachable')
      expect(transaction.signature.init).toMatchObject({ threshold: 2 })
      expect(transaction.nonce).toBe(0n)
    }

    {
      const { request } = await Actions.transaction.prepare(client, {
        calls: [
          Actions.token.transfer.call(client, {
            amount: 1n,
            to,
            token: pathUsd,
          }),
        ],
        feeToken: pathUsd,
        multisig: config,
      })
      const signatures = await Promise.all(
        [owner1, owner2].map((owner) =>
          Actions.transaction.sign(client, { ...request, account: owner }),
        ),
      )
      const receipt = await Actions.transaction.sendSync(client, {
        ...request,
        account,
        signatures,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())

      const transaction = await Actions.transaction.get(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.signature?.type).toBe('multisig')
      if (transaction.signature?.type !== 'multisig')
        throw new Error('unreachable')
      expect(transaction.signature.init).toBeUndefined()
      expect(transaction.nonce).toBe(1n)
    }
  })

  test('2-of-3 (M-of-N): threshold subset of owners approves', async () => {
    const owner1 = Account.fromSecp256k1(accounts[3].privateKey)
    const owner2 = Account.fromSecp256k1(accounts[4].privateKey)
    const owner3 = Account.fromSecp256k1(accounts[5].privateKey)
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner1.address, weight: 1 },
        { owner: owner2.address, weight: 1 },
        { owner: owner3.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const client = tempo.getClient()
    await Actions.token.transferSync(client, {
      amount: 10_000_000n,
      to: account.address,
      token: pathUsd,
    })

    const { request } = await Actions.transaction.prepare(client, {
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: pathUsd,
        }),
      ],
      feeToken: pathUsd,
      multisig: config,
    })
    const signatures = await Promise.all(
      [owner1, owner3].map((owner) =>
        Actions.transaction.sign(client, { ...request, account: owner }),
      ),
    )
    const receipt = await Actions.transaction.sendSync(client, {
      ...request,
      account,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('weighted threshold: single heavy owner meets threshold', async () => {
    const heavy = Account.fromSecp256k1(accounts[6].privateKey)
    const light = Account.fromSecp256k1(accounts[7].privateKey)
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: heavy.address, weight: 2 },
        { owner: light.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const client = tempo.getClient()
    await Actions.token.transferSync(client, {
      amount: 10_000_000n,
      to: account.address,
      token: pathUsd,
    })

    const { request } = await Actions.transaction.prepare(client, {
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: pathUsd,
        }),
      ],
      feeToken: pathUsd,
      multisig: config,
    })

    const lightSignature = await Actions.transaction.sign(client, {
      ...request,
      account: light,
    })
    await expect(
      Actions.transaction.sendSync(client, {
        ...request,
        account,
        signatures: [lightSignature],
      }),
    ).rejects.toThrow()

    const heavySignature = await Actions.transaction.sign(client, {
      ...request,
      account: heavy,
    })
    const receipt = await Actions.transaction.sendSync(client, {
      ...request,
      account,
      signatures: [heavySignature],
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('account hoisted to client: send without explicit `account`', async () => {
    const owner1 = Account.fromSecp256k1(accounts[8].privateKey)
    const owner2 = Account.fromSecp256k1(accounts[9].privateKey)
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner1.address, weight: 1 },
        { owner: owner2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const client = tempo.getClient()
    const accountClient = tempo.getClient({ account })
    await Actions.token.transferSync(client, {
      amount: 10_000_000n,
      to: account.address,
      token: pathUsd,
    })

    const { request } = await Actions.transaction.prepare(client, {
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: pathUsd,
        }),
      ],
      feeToken: pathUsd,
      multisig: config,
    })
    const signatures = await Promise.all(
      [owner1, owner2].map((owner) =>
        Actions.transaction.sign(client, { ...request, account: owner }),
      ),
    )
    const receipt = await Actions.transaction.sendSync(accountClient, {
      ...request,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('infer multisig from `account` (no `multisig` field)', async () => {
    const owner1 = Account.fromSecp256k1(accounts[1].privateKey)
    const owner2 = Account.fromSecp256k1(accounts[3].privateKey)
    const account = Account.fromMultisig({
      threshold: 2,
      owners: [
        { owner: owner1.address, weight: 1 },
        { owner: owner2.address, weight: 1 },
      ],
    })

    const client = tempo.getClient()
    await Actions.token.transferSync(client, {
      amount: 10_000_000n,
      to: account.address,
      token: pathUsd,
    })

    const { request } = await Actions.transaction.prepare(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: pathUsd,
        }),
      ],
      feeToken: pathUsd,
    })
    const signatures = await Promise.all(
      [owner1, owner2].map((owner) =>
        Actions.transaction.sign(client, { ...request, account: owner }),
      ),
    )
    const receipt = await Actions.transaction.sendSync(client, {
      ...request,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('fee payer sponsors bootstrap multisig', async () => {
    const owner1 = Account.fromSecp256k1(accounts[4].privateKey)
    const owner2 = Account.fromSecp256k1(accounts[6].privateKey)
    const feePayer = Account.fromSecp256k1(accounts[0].privateKey)
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner1.address, weight: 1 },
        { owner: owner2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const client = tempo.getClient()
    const { request } = await Actions.transaction.prepare(client, {
      feePayer,
      multisig: config,
      to: account.address,
      value: 0n,
    })
    const signatures = await Promise.all(
      [owner1, owner2].map((owner) =>
        Actions.transaction.sign(client, { ...request, account: owner }),
      ),
    )
    const receipt = await Actions.transaction.sendSync(client, {
      ...request,
      account,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
    expect(receipt.feePayer).toBe(feePayer.address.toLowerCase())
  })
})
