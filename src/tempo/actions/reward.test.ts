import { parseUnits } from 'viem'
import { describe, expect, test } from 'vitest'
import { accounts, getClient, setupToken } from '~test/tempo/config.js'
import * as actions from './index.js'

const account = accounts[0]
const client = getClient({
  account,
})

describe('claimSync', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    const balanceBefore = await actions.token.getBalance(client, {
      token,
    })

    // Opt in to rewards
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    // Mint reward tokens
    const rewardAmount = parseUnits('100', 6)
    await actions.token.mintSync(client, {
      amount: rewardAmount,
      to: account.address,
      token,
    })

    // Distribute rewards
    await actions.reward.distributeSync(client, {
      amount: rewardAmount,
      token,
    })

    // Trigger reward accrual by transferring
    await actions.token.transferSync(client, {
      amount: 1n,
      to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      token,
    })

    // Claim rewards
    await actions.reward.claimSync(client, {
      token,
    })

    const balanceAfter = await actions.token.getBalance(client, {
      token,
    })

    expect(balanceAfter).toBeGreaterThan(
      balanceBefore + rewardAmount - parseUnits('1', 6),
    )
  })
})

describe('distributeSync', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    // Opt in to rewards
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    const balanceBeforeReward = await actions.token.getBalance(client, {
      token,
    })

    // Mint reward tokens
    const rewardAmount = parseUnits('100', 6)
    await actions.token.mintSync(client, {
      amount: rewardAmount,
      to: account.address,
      token,
    })

    // Distribute rewards
    const { amount, funder, receipt } = await actions.reward.distributeSync(
      client,
      {
        amount: rewardAmount,
        token,
      },
    )

    expect(receipt).toBeDefined()
    expect(funder).toBe(account.address)
    expect(amount).toBe(rewardAmount)

    // Trigger reward distribution by transferring
    await actions.token.transferSync(client, {
      amount: 1n,
      to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      token,
    })

    // Claim the accumulated rewards
    await actions.reward.claimSync(client, {
      token,
    })

    const balanceAfter = await actions.token.getBalance(client, {
      token,
    })

    // Account should have received rewards
    expect(balanceAfter).toBeGreaterThanOrEqual(
      balanceBeforeReward + rewardAmount - 1n,
    )
  })
})

describe('getGlobalRewardPerToken', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    const rewardPerToken = await actions.reward.getGlobalRewardPerToken(
      client,
      {
        token,
      },
    )

    expect(rewardPerToken).toBe(0n)
  })

  test('behavior: after distribution', async () => {
    const { token } = await setupToken(client)

    // Opt in to rewards
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    // Mint reward tokens
    const rewardAmount = parseUnits('100', 6)
    await actions.token.mintSync(client, {
      amount: rewardAmount,
      to: account.address,
      token,
    })

    // Distribute rewards
    await actions.reward.distributeSync(client, {
      amount: rewardAmount,
      token,
    })

    const rewardPerToken = await actions.reward.getGlobalRewardPerToken(
      client,
      {
        token,
      },
    )

    expect(rewardPerToken).toBeGreaterThan(0n)
  })
})

describe('getPendingRewards', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    const pending = await actions.reward.getPendingRewards(client, {
      token,
      account: account.address,
    })

    expect(pending).toBe(0n)
  })

  test('behavior: after distribution', async () => {
    const { token } = await setupToken(client)

    // Opt in to rewards
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    // Mint reward tokens
    const rewardAmount = parseUnits('100', 6)
    await actions.token.mintSync(client, {
      amount: rewardAmount,
      to: account.address,
      token,
    })

    // Distribute rewards
    await actions.reward.distributeSync(client, {
      amount: rewardAmount,
      token,
    })

    const pending = await actions.reward.getPendingRewards(client, {
      token,
      account: account.address,
    })

    expect(pending).toBeGreaterThan(0n)
  })
})

describe('getUserRewardInfo', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    const info = await actions.reward.getUserRewardInfo(client, {
      token,
      account: account.address,
    })

    expect(info.rewardRecipient).toBeDefined()
    expect(info.rewardPerToken).toBeDefined()
    expect(info.rewardBalance).toBeDefined()
    expect(info.rewardRecipient).toBe(
      '0x0000000000000000000000000000000000000000',
    )
    expect(info.rewardPerToken).toBe(0n)
    expect(info.rewardBalance).toBe(0n)
  })

  test('behavior: after opting in', async () => {
    const { token } = await setupToken(client)

    // Opt in to rewards
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    const info = await actions.reward.getUserRewardInfo(client, {
      token,
      account: account.address,
    })

    expect(info.rewardRecipient).toBe(account.address)
    expect(info.rewardPerToken).toBe(0n)
    expect(info.rewardBalance).toBe(0n)
  })

  test('behavior: with active rewards after distribution', async () => {
    const { token } = await setupToken(client)

    // Opt in to rewards
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    // Mint reward tokens
    const rewardAmount = parseUnits('100', 6)
    await actions.token.mintSync(client, {
      amount: rewardAmount,
      to: account.address,
      token,
    })

    // Distribute rewards
    await actions.reward.distributeSync(client, {
      amount: rewardAmount,
      token,
    })

    // Trigger reward accrual by transferring
    await actions.token.transferSync(client, {
      amount: 1n,
      to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      token,
    })

    // Check reward info shows accumulated rewards
    const info = await actions.reward.getUserRewardInfo(client, {
      token,
      account: account.address,
    })

    expect(info.rewardRecipient).toBe(account.address)
    expect(info.rewardPerToken).toBeGreaterThan(0n)
    expect(info.rewardBalance).toBeGreaterThan(0n)
    // Should have approximately the full reward amount (minus the 1 token transferred)
    expect(info.rewardBalance).toBeGreaterThanOrEqual(
      rewardAmount - parseUnits('1', 6),
    )
  })
})

describe('setRecipientSync', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    // Set reward recipient to self
    const { holder, receipt, recipient } =
      await actions.reward.setRecipientSync(client, {
        recipient: account.address,
        token,
      })

    expect(receipt).toBeDefined()
    expect(holder).toBe(account.address)
    expect(recipient).toBe(account.address)
  })

  test('behavior: opt out with zero address', async () => {
    const { token } = await setupToken(client)

    // First opt in
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    // Then opt out
    const { holder, recipient } = await actions.reward.setRecipientSync(
      client,
      {
        recipient: '0x0000000000000000000000000000000000000000',
        token,
      },
    )

    expect(holder).toBe(account.address)
    expect(recipient).toBe('0x0000000000000000000000000000000000000000')
  })
})

describe('watchRewardDistributed', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    // Opt in to rewards
    await actions.reward.setRecipientSync(client, {
      recipient: account.address,
      token,
    })

    // Mint reward tokens
    const rewardAmount = parseUnits('100', 6)
    await actions.token.mintSync(client, {
      amount: rewardAmount,
      to: account.address,
      token,
    })

    const events: Array<{
      args: actions.reward.watchRewardDistributed.Args
      log: actions.reward.watchRewardDistributed.Log
    }> = []

    const unwatch = actions.reward.watchRewardDistributed(client, {
      token,
      onRewardDistributed: (args, log) => {
        events.push({ args, log })
      },
    })

    try {
      await actions.reward.distributeSync(client, {
        amount: rewardAmount,
        token,
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(events.length).toBeGreaterThan(0)
      expect(events[0]?.args.amount).toBe(rewardAmount)
      expect(events[0]?.args.funder).toBe(account.address)
      expect(events[0]?.log).toBeDefined()
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchRewardRecipientSet', () => {
  test('default', async () => {
    const { token } = await setupToken(client)

    const events: Array<{
      args: actions.reward.watchRewardRecipientSet.Args
      log: actions.reward.watchRewardRecipientSet.Log
    }> = []

    const unwatch = actions.reward.watchRewardRecipientSet(client, {
      token,
      onRewardRecipientSet: (args, log) => {
        events.push({ args, log })
      },
    })

    try {
      await actions.reward.setRecipientSync(client, {
        recipient: account.address,
        token,
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(events.length).toBeGreaterThan(0)
      expect(events[0]?.args.holder).toBe(account.address)
      expect(events[0]?.args.recipient).toBe(account.address)
      expect(events[0]?.log).toBeDefined()
    } finally {
      if (unwatch) unwatch()
    }
  })
})
