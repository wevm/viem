import { setTimeout } from 'node:timers/promises'
import { isAddressEqual, parseUnits, zeroAddress } from 'viem'
import { ReceivePolicyReceipt } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  chain,
  feeToken,
  getClient,
  setupFeeToken,
  setupToken,
} from '~test/tempo/config.js'
import * as actions from './index.js'

const account = accounts[0]
const receiverAccount = accounts[1]

const client = getClient({ account, chain: chain.extend({ feeToken }) })
const receiverClient = getClient({
  account: receiverAccount,
  chain: chain.extend({ feeToken }),
})

beforeAll(async () => {
  // fund the receiver so it can pay fees for `setReceivePolicy` / `claim`.
  await setupFeeToken(client, { account: receiverAccount })
})

// Creates a token, configures the receiver to reject all senders, transfers to
// the receiver (which gets blocked), and returns the resulting claim receipt.
async function createBlockedTransfer(amount = parseUnits('10', 6)) {
  const { token } = await setupToken(client)

  // receiver rejects all senders; recovery defaults to the originator.
  await actions.receivePolicy.setSync(receiverClient, {
    senderPolicyId: 'reject-all',
  })

  const { receipt } = await actions.token.transferSync(client, {
    token,
    to: receiverAccount.address,
    amount,
  })

  const [claimReceipt] = ReceivePolicyReceipt.fromTransactionReceipt(receipt)
  return { token, amount, claimReceipt: claimReceipt! }
}

describe('set / get', () => {
  test('default', async () => {
    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'allow-all',
      tokenFilterId: 'allow-all',
      recovery: 'self',
    })

    const policy = await actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy.hasReceivePolicy).toBe(true)
    expect(policy.senderPolicyId).toBe('allow-all')
    expect(policy.tokenFilterId).toBe('allow-all')
    expect(policy.recovery).toBe('self')
    expect(policy.recoveryAuthority).toBe(receiverAccount.address)
  })

  test('behavior: reject-all sender policy', async () => {
    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'reject-all',
    })

    const policy = await actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy.senderPolicyId).toBe('reject-all')
    expect(policy.tokenFilterId).toBe('allow-all')
  })

  test('behavior: custom policy id', async () => {
    const { policyId } = await actions.policy.createSync(receiverClient, {
      type: 'whitelist',
    })
    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: policyId,
    })

    const policy = await actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy.senderPolicyId).toBe(policyId)
  })

  test('behavior: recovery sender (default)', async () => {
    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'allow-all',
      tokenFilterId: 'allow-all',
    })

    const policy = await actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy.recovery).toBe('sender')
    expect(policy.recoveryAuthority).toBe(zeroAddress)
  })
})

describe('validate', () => {
  test('behavior: allowed when no policy', async () => {
    const { token } = await setupToken(client)
    const { authorized, blockedReason } = await actions.receivePolicy.validate(
      client,
      {
        token,
        sender: account.address,
        receiver: accounts[2]!.address,
      },
    )
    expect(authorized).toBe(true)
    expect(blockedReason).toBe('none')
  })

  test('behavior: blocked by sender policy', async () => {
    const { token } = await setupToken(client)

    // reject all senders.
    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'reject-all',
    })

    const { authorized, blockedReason } = await actions.receivePolicy.validate(
      client,
      {
        token,
        sender: account.address,
        receiver: receiverAccount.address,
      },
    )
    expect(authorized).toBe(false)
    expect(blockedReason).toBe('receivePolicy')
  })
})

describe('blocked transfer lifecycle', () => {
  test('behavior: block then claim by originator', async () => {
    const { token } = await setupToken(client)
    const amount = parseUnits('10', 6)

    // receiver rejects all senders; funds bounce back to originator.
    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'reject-all',
      recovery: 'sender',
    })

    // transfer is blocked (still succeeds).
    const { receipt: transferReceipt } = await actions.token.transferSync(
      client,
      {
        token,
        to: receiverAccount.address,
        amount,
      },
    )

    const receipts =
      ReceivePolicyReceipt.fromTransactionReceipt(transferReceipt)
    expect(receipts.length).toBe(1)
    const claimReceipt = receipts[0]!

    // blocked amount is attributed to the receipt.
    const blockedBalance = await actions.receivePolicy.getBlockedBalance(
      client,
      { receipt: claimReceipt },
    )
    expect(blockedBalance).toBe(amount)

    // receipt decodes to the original transfer context.
    const decoded = ReceivePolicyReceipt.decode(claimReceipt)
    expect(isAddressEqual(decoded.originator, account.address)).toBe(true)
    expect(isAddressEqual(decoded.recipient, receiverAccount.address)).toBe(
      true,
    )
    expect(decoded.kind).toBe('transfer')
    expect(decoded.blockedReason).toBe('receivePolicy')

    // originator reclaims the funds.
    await actions.receivePolicy.claimSync(client, {
      to: account.address,
      receipt: claimReceipt,
    })

    const remaining = await actions.receivePolicy.getBlockedBalance(client, {
      receipt: claimReceipt,
    })
    expect(remaining).toBe(0n)
  })
})

describe('burnSync', () => {
  test('default', async () => {
    const { token, amount, claimReceipt } = await createBlockedTransfer()

    // grant the burn role to the caller.
    await actions.token.grantRolesSync(client, {
      token,
      to: account.address,
      roles: ['burnBlocked'],
    })

    // make the originator unauthorized as a sender under the token's policy
    // (burning is only allowed for blocked senders).
    const { policyId } = await actions.policy.createSync(client, {
      type: 'blacklist',
    })
    await actions.policy.modifyBlacklistSync(client, {
      policyId,
      address: account.address,
      restricted: true,
    })
    await actions.token.changeTransferPolicySync(client, {
      token,
      policyId,
    })

    const { receipt, ...result } = await actions.receivePolicy.burnSync(
      client,
      {
        receipt: claimReceipt,
      },
    )
    expect(receipt.status).toBe('success')
    expect(result.amount).toBe(amount)
    expect(result.originator).toBe(account.address)

    const remaining = await actions.receivePolicy.getBlockedBalance(client, {
      receipt: claimReceipt,
    })
    expect(remaining).toBe(0n)
  })
})

describe('watchUpdated', () => {
  test('default', async () => {
    const logs: any[] = []
    const unwatch = actions.receivePolicy.watchUpdated(client, {
      onUpdated: (args, log) => {
        logs.push({ args, log })
      },
    })

    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'allow-all',
      tokenFilterId: 'allow-all',
      recovery: 'self',
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(logs[0].args.account).toBe(receiverAccount.address)
    expect(logs[0].args.recovery).toBe('self')
  })
})

describe('watchBlocked', () => {
  test('default', async () => {
    const { token } = await setupToken(client)
    await actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'reject-all',
    })

    const logs: any[] = []
    const unwatch = actions.receivePolicy.watchBlocked(client, {
      onBlocked: (args, log) => {
        logs.push({ args, log })
      },
    })

    await actions.token.transferSync(client, {
      token,
      to: receiverAccount.address,
      amount: parseUnits('1', 6),
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(logs[0].args.receiver).toBe(receiverAccount.address)
    expect(logs[0].args.claimReceipt).toBeDefined()
  })
})

describe('watchClaimed', () => {
  test('default', async () => {
    const { amount, claimReceipt } = await createBlockedTransfer()

    const logs: any[] = []
    const unwatch = actions.receivePolicy.watchClaimed(client, {
      onClaimed: (args, log) => {
        logs.push({ args, log })
      },
    })

    await actions.receivePolicy.claimSync(client, {
      to: account.address,
      receipt: claimReceipt,
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(logs[0].args.amount).toBe(amount)
    expect(logs[0].args.to).toBe(account.address)
  })
})

describe('watchBurned', () => {
  test('default', async () => {
    const { token, amount, claimReceipt } = await createBlockedTransfer()

    await actions.token.grantRolesSync(client, {
      token,
      to: account.address,
      roles: ['burnBlocked'],
    })
    const { policyId } = await actions.policy.createSync(client, {
      type: 'blacklist',
    })
    await actions.policy.modifyBlacklistSync(client, {
      policyId,
      address: account.address,
      restricted: true,
    })
    await actions.token.changeTransferPolicySync(client, {
      token,
      policyId,
    })

    const logs: any[] = []
    const unwatch = actions.receivePolicy.watchBurned(client, {
      onBurned: (args, log) => {
        logs.push({ args, log })
      },
    })

    await actions.receivePolicy.burnSync(client, {
      receipt: claimReceipt,
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBeGreaterThanOrEqual(1)
    expect(logs[0].args.amount).toBe(amount)
    expect(logs[0].args.originator).toBe(account.address)
  })
})
