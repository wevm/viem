import * as tempo from '~test/tempo.js'
import * as AbiEvent from 'ox/AbiEvent'
import { beforeAll, describe, expect, test } from 'vitest'

import { Account } from 'viem'
import { Actions, ReceivePolicyReceipt } from 'viem/tempo'

import * as Abis from '../Abis.js'

const client = tempo.getClient()
const receiver = tempo.accounts[1]
const receiverClient = tempo.getClient({
  account: Account.fromPrivateKey(receiver.privateKey),
})

beforeAll(async () => {
  // Fund the receiver so it can pay fees for policy configuration.
  await Actions.token.transferSync(client, {
    amount: 10_000_000_000n,
    feeToken: tempo.alphaUsd,
    to: receiver.address,
    token: tempo.alphaUsd,
  } as never)
})

/** Creates a fresh USD token, issuer-granted and funded to account 0. */
async function createToken() {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    feeToken: tempo.alphaUsd,
    name: 'Receive Policy Token',
    symbol: 'RPT',
  } as never)
  await Actions.token.grantRolesSync(client, {
    feeToken: tempo.alphaUsd,
    roles: ['issuer'],
    to: client.account!.address,
    token,
  } as never)
  await Actions.token.mintSync(client, {
    amount: 1_000_000_000n,
    feeToken: tempo.alphaUsd,
    to: client.account!.address,
    token,
  } as never)
  return token
}

/** Blocks a transfer to the receiver, returning its claim receipt. */
async function createBlockedTransfer(amount = 10_000_000n) {
  const token = await createToken()

  // The receiver rejects all senders; the originator stays the claimer.
  await Actions.receivePolicy.setSync(receiverClient, {
    feeToken: tempo.alphaUsd,
    senderPolicyId: 'reject-all',
  } as never)

  // The blocked transfer still succeeds; the funds land in the guard.
  const { receipt } = await Actions.token.transferSync(client, {
    amount,
    feeToken: tempo.alphaUsd,
    to: receiver.address,
    token,
  } as never)

  const [claimReceipt] = ReceivePolicyReceipt.fromTransactionReceipt(receipt)
  return { amount, claimReceipt: claimReceipt!, token }
}

/** Waits until `done` returns true, polling every 100ms (5s cap). */
async function waitFor(done: () => boolean) {
  for (let i = 0; i < 50 && !done(); i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('set / get', () => {
  test('default', async () => {
    const { receipt, ...result } = await Actions.receivePolicy.setSync(
      receiverClient,
      {
        claimer: 'self',
        feeToken: tempo.alphaUsd,
        senderPolicyId: 'allow-all',
        tokenPolicyId: 'allow-all',
      } as never,
    )
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "claimer": "self",
        "recoveryAuthority": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "senderPolicyId": "allow-all",
        "tokenPolicyId": "allow-all",
      }
    `)

    await expect(
      Actions.receivePolicy.get(client, { account: receiver.address }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "claimer": "self",
        "hasReceivePolicy": true,
        "recoveryAuthority": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "senderPolicyId": "allow-all",
        "senderPolicyType": "blacklist",
        "tokenPolicyId": "allow-all",
        "tokenPolicyType": "blacklist",
      }
    `)
  })

  test('behavior: reject-all sender policy', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      feeToken: tempo.alphaUsd,
      senderPolicyId: 'reject-all',
    } as never)

    await expect(
      Actions.receivePolicy.get(client, { account: receiver.address }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "claimer": "sender",
        "hasReceivePolicy": true,
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "senderPolicyId": "reject-all",
        "senderPolicyType": "whitelist",
        "tokenPolicyId": "allow-all",
        "tokenPolicyType": "blacklist",
      }
    `)
  })

  test('behavior: custom policy id', async () => {
    const { policyId } = await Actions.policy.createSync(receiverClient, {
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)
    await Actions.receivePolicy.setSync(receiverClient, {
      feeToken: tempo.alphaUsd,
      senderPolicyId: policyId,
    } as never)

    const { senderPolicyId, ...policy } = await Actions.receivePolicy.get(
      client,
      { account: receiver.address },
    )
    expect(senderPolicyId).toBe(policyId)
    expect(policy).toMatchInlineSnapshot(`
      {
        "claimer": "sender",
        "hasReceivePolicy": true,
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "senderPolicyType": "whitelist",
        "tokenPolicyId": "allow-all",
        "tokenPolicyType": "blacklist",
      }
    `)
  })

  test('behavior: claimer sender (default)', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      feeToken: tempo.alphaUsd,
      senderPolicyId: 'allow-all',
      tokenPolicyId: 'allow-all',
    } as never)

    await expect(
      Actions.receivePolicy.get(client, { account: receiver.address }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "claimer": "sender",
        "hasReceivePolicy": true,
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "senderPolicyId": "allow-all",
        "senderPolicyType": "blacklist",
        "tokenPolicyId": "allow-all",
        "tokenPolicyType": "blacklist",
      }
    `)
  })
})

describe('validate', () => {
  test('behavior: allowed when no policy', async () => {
    const token = await createToken()

    await expect(
      Actions.receivePolicy.validate(client, {
        receiver: tempo.accounts[2].address,
        sender: client.account!.address,
        token,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "authorized": true,
        "blockedReason": "none",
      }
    `)
  })

  test('behavior: blocked by sender policy', async () => {
    const token = await createToken()

    await Actions.receivePolicy.setSync(receiverClient, {
      feeToken: tempo.alphaUsd,
      senderPolicyId: 'reject-all',
    } as never)

    await expect(
      Actions.receivePolicy.validate(client, {
        receiver: receiver.address,
        sender: client.account!.address,
        token,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "authorized": false,
        "blockedReason": "receivePolicy",
      }
    `)
  })
})

describe('blocked transfer lifecycle', () => {
  test('behavior: block then claim by originator', async () => {
    const token = await createToken()
    const amount = 10_000_000n

    // The receiver rejects all senders; the originator stays the claimer.
    await Actions.receivePolicy.setSync(receiverClient, {
      claimer: 'sender',
      feeToken: tempo.alphaUsd,
      senderPolicyId: 'reject-all',
    } as never)

    // The blocked transfer still succeeds; the funds land in the guard.
    const { receipt } = await Actions.token.transferSync(client, {
      amount,
      feeToken: tempo.alphaUsd,
      to: receiver.address,
      token,
    } as never)

    // The extracted witness matches the raw `TransferBlocked` log argument.
    const receipts = ReceivePolicyReceipt.fromTransactionReceipt(receipt)
    const [blockedLog] = AbiEvent.extractLogs(
      Abis.receivePolicyGuard,
      receipt.logs,
      { eventName: 'TransferBlocked', strict: true },
    )
    expect(receipts).toStrictEqual([blockedLog!.args.receipt])
    const claimReceipt = receipts[0]!

    // The blocked amount is attributed to the receipt.
    await expect(
      Actions.receivePolicy.getBlockedBalance(client, {
        receipt: claimReceipt,
      }),
    ).resolves.toBe(amount)

    // The receipt decodes to the original transfer context.
    const {
      blockedAt,
      blockedNonce,
      token: receiptToken,
      ...decoded
    } = ReceivePolicyReceipt.decode(claimReceipt)
    expect(receiptToken).toBe(token)
    expect(blockedAt).toBeGreaterThan(0n)
    expect(blockedNonce).toBeGreaterThanOrEqual(0n)
    expect(decoded).toMatchInlineSnapshot(`
      {
        "blockedReason": "receivePolicy",
        "kind": "transfer",
        "memo": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "originator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "version": 1,
      }
    `)

    // The originator reclaims the funds.
    const {
      blockedAt: claimedAt,
      blockedNonce: claimedNonce,
      receipt: claimTxReceipt,
      token: claimedToken,
      ...claimed
    } = await Actions.receivePolicy.claimSync(client, {
      feeToken: tempo.alphaUsd,
      receipt: claimReceipt,
      to: client.account!.address,
    } as never)
    expect(claimTxReceipt.status).toBe('success')
    expect(claimedToken).toBe(token)
    expect(claimedAt).toBe(blockedAt)
    expect(claimedNonce).toBe(blockedNonce)
    expect(claimed).toMatchInlineSnapshot(`
      {
        "amount": 10000000n,
        "caller": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "originator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "receiptVersion": 1,
        "receiver": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(
      Actions.receivePolicy.getBlockedBalance(client, {
        receipt: claimReceipt,
      }),
    ).resolves.toBe(0n)
  })
})

describe('burnSync', () => {
  test('default', async () => {
    const { claimReceipt, token } = await createBlockedTransfer()

    // Burning requires the burn-blocked role.
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['burnBlocked'],
      to: client.account!.address,
      token,
    } as never)

    // Burning also requires the originator to be unauthorized as a sender
    // under the token's policy.
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'blacklist',
    } as never)
    await Actions.policy.modifyBlacklistSync(client, {
      address: client.account!.address,
      feeToken: tempo.alphaUsd,
      policyId,
      restricted: true,
    } as never)
    await Actions.token.changeTransferPolicySync(client, {
      feeToken: tempo.alphaUsd,
      policyId,
      token,
    } as never)

    const {
      blockedAt,
      blockedNonce,
      receipt,
      token: burnedToken,
      ...result
    } = await Actions.receivePolicy.burnSync(client, {
      feeToken: tempo.alphaUsd,
      receipt: claimReceipt,
    } as never)
    expect(receipt.status).toBe('success')
    expect(burnedToken).toBe(token)
    expect(blockedAt).toBeGreaterThan(0n)
    expect(blockedNonce).toBeGreaterThanOrEqual(0n)
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 10000000n,
        "caller": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "originator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "receiptVersion": 1,
        "receiver": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
      }
    `)

    await expect(
      Actions.receivePolicy.getBlockedBalance(client, {
        receipt: claimReceipt,
      }),
    ).resolves.toBe(0n)
  })
})

describe('watchUpdated', () => {
  test('default', async () => {
    const watcher = Actions.receivePolicy.watchUpdated(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.receivePolicy.setSync(receiverClient, {
        claimer: 'self',
        feeToken: tempo.alphaUsd,
        senderPolicyId: 'allow-all',
        tokenPolicyId: 'allow-all',
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "recoveryAuthority": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "senderPolicyId": 1n,
          "tokenFilterId": 1n,
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchBlocked', () => {
  test('default', async () => {
    const token = await createToken()
    await Actions.receivePolicy.setSync(receiverClient, {
      feeToken: tempo.alphaUsd,
      senderPolicyId: 'reject-all',
    } as never)

    const watcher = Actions.receivePolicy.watchBlocked(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      const { receipt } = await Actions.token.transferSync(client, {
        amount: 1_000_000n,
        feeToken: tempo.alphaUsd,
        to: receiver.address,
        token,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      const {
        blockedNonce,
        receipt: eventReceipt,
        token: blockedToken,
        ...args
      } = logs[0]!.args
      expect(blockedToken).toBe(token)
      expect(blockedNonce).toBeGreaterThanOrEqual(0n)
      expect(eventReceipt).toBe(
        ReceivePolicyReceipt.fromTransactionReceipt(receipt)[0],
      )
      expect(args).toMatchInlineSnapshot(`
        {
          "amount": 1000000n,
          "receiptVersion": 1,
          "receiver": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchClaimed', () => {
  test('default', async () => {
    const { claimReceipt, token } = await createBlockedTransfer()

    const watcher = Actions.receivePolicy.watchClaimed(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.receivePolicy.claimSync(client, {
        feeToken: tempo.alphaUsd,
        receipt: claimReceipt,
        to: client.account!.address,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      const {
        blockedAt,
        blockedNonce,
        token: claimedToken,
        ...args
      } = logs[0]!.args
      expect(claimedToken).toBe(token)
      expect(blockedAt).toBeGreaterThan(0n)
      expect(blockedNonce).toBeGreaterThanOrEqual(0n)
      expect(args).toMatchInlineSnapshot(`
        {
          "amount": 10000000n,
          "caller": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "originator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "receiptVersion": 1,
          "receiver": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "recoveryAuthority": "0x0000000000000000000000000000000000000000",
          "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchBurned', () => {
  test('default', async () => {
    const { claimReceipt, token } = await createBlockedTransfer()

    // Burning requires the burn-blocked role.
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['burnBlocked'],
      to: client.account!.address,
      token,
    } as never)

    // Burning also requires the originator to be unauthorized as a sender
    // under the token's policy.
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'blacklist',
    } as never)
    await Actions.policy.modifyBlacklistSync(client, {
      address: client.account!.address,
      feeToken: tempo.alphaUsd,
      policyId,
      restricted: true,
    } as never)
    await Actions.token.changeTransferPolicySync(client, {
      feeToken: tempo.alphaUsd,
      policyId,
      token,
    } as never)

    const watcher = Actions.receivePolicy.watchBurned(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.receivePolicy.burnSync(client, {
        feeToken: tempo.alphaUsd,
        receipt: claimReceipt,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      const {
        blockedAt,
        blockedNonce,
        token: burnedToken,
        ...args
      } = logs[0]!.args
      expect(burnedToken).toBe(token)
      expect(blockedAt).toBeGreaterThan(0n)
      expect(blockedNonce).toBeGreaterThanOrEqual(0n)
      expect(args).toMatchInlineSnapshot(`
        {
          "amount": 10000000n,
          "caller": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "originator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "receiptVersion": 1,
          "receiver": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})
