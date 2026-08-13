import {
  getTransaction,
  prepareTransactionRequest,
  sendTransactionSync,
  signTransaction,
} from 'viem/actions'
import { Account, Actions, MultisigConfig } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempo/config.js'

const client = tempo.getClient()

describe('fromMultisig', () => {
  const { accounts, feeToken } = tempo

  const to = '0x0000000000000000000000000000000000000001'

  test('flat 2-of-2: init + subsequent', async () => {
    const owner_1 = accounts[1]
    const owner_2 = accounts[2]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    {
      const request = await prepareTransactionRequest(client, {
        calls: [
          Actions.token.transfer.call(client, {
            amount: 1n,
            to,
            token: feeToken,
          }),
        ],
        feeToken,
        multisig: config,
      })
      const signatures = await Promise.all(
        [owner_1, owner_2].map((owner) =>
          signTransaction(client, { ...request, account: owner }),
        ),
      )
      const receipt = await sendTransactionSync(client, {
        ...request,
        account,
        signatures,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())

      const tx = await getTransaction(client, { hash: receipt.transactionHash })
      expect(tx.signature?.type).toBe('multisig')
      if (tx.signature?.type !== 'multisig') throw new Error('unreachable')
      expect(tx.signature.init).toMatchObject({ threshold: 2 })
      expect(tx.nonce).toBe(0)
    }

    {
      const request = await prepareTransactionRequest(client, {
        calls: [
          Actions.token.transfer.call(client, {
            amount: 1n,
            to,
            token: feeToken,
          }),
        ],
        feeToken,
        multisig: config,
      })
      const signatures = await Promise.all(
        [owner_1, owner_2].map((owner) =>
          signTransaction(client, { ...request, account: owner }),
        ),
      )
      const receipt = await sendTransactionSync(client, {
        ...request,
        account,
        signatures,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())

      const tx = await getTransaction(client, { hash: receipt.transactionHash })
      expect(tx.signature?.type).toBe('multisig')
      if (tx.signature?.type !== 'multisig') throw new Error('unreachable')
      expect(tx.signature.init).toBeUndefined()
      expect(tx.nonce).toBe(1)
    }
  })

  test('2-of-3 (M-of-N): threshold subset of owners approves', async () => {
    const owner_1 = accounts[3]
    const owner_2 = accounts[4]
    const owner_3 = accounts[5]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
        { owner: owner_3.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
      multisig: config,
    })
    const signatures = await Promise.all(
      [owner_1, owner_3].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(client, {
      ...request,
      account,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('weighted threshold: single heavy owner meets threshold', async () => {
    const owner_1 = accounts[6]
    const owner_2 = accounts[7]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 2 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
      multisig: config,
    })
    const lightSignature = await signTransaction(client, {
      ...request,
      account: owner_2,
    })
    await expect(
      sendTransactionSync(client, {
        ...request,
        account,
        signatures: [lightSignature],
      }),
    ).rejects.toThrow()

    const heavySignature = await signTransaction(client, {
      ...request,
      account: owner_1,
    })
    const receipt = await sendTransactionSync(client, {
      ...request,
      account,
      signatures: [heavySignature],
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('account hoisted to client: send without explicit `account`', async () => {
    const owner_1 = accounts[8]
    const owner_2 = accounts[9]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const accountClient = tempo.getClient({ account })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
      multisig: config,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(accountClient, {
      ...request,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('infer multisig from `account` (no `multisig` field)', async () => {
    const owner_1 = accounts[10]
    const owner_2 = accounts[11]
    const account = Account.fromMultisig({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(client, {
      ...request,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('fee payer sponsors bootstrap multisig', async () => {
    const owner_1 = accounts[12]
    const owner_2 = accounts[13]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const request = await prepareTransactionRequest(client, {
      feePayer: accounts[0],
      multisig: config,
      to: account.address,
      value: 0n,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(client, {
      ...request,
      account,
      signatures,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
    expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
  })
})
