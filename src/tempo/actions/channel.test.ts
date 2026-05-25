import { Hex } from 'ox'
import type { Address } from 'viem'
import { parseUnits, zeroAddress, zeroHash } from 'viem'
import { Channel } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  chain,
  feeToken,
  getClient,
  nodeEnv,
  setupFeeToken,
  setupToken,
} from '~test/tempo/config.js'
import * as actions from './index.js'

const payer = accounts[0]
const payee = accounts[1]
const operator = accounts[2]

const payerClient = getClient({
  account: payer,
  chain: chain.extend({ feeToken }),
})

const operatorClient = getClient({
  account: operator,
  chain: chain.extend({ feeToken }),
})

let tokenId = 0
let channelReserveSupported = false

describe.runIf(nodeEnv === 'localnet')('channel', () => {
  beforeAll(async () => {
    channelReserveSupported = await supportsChannelReserve()
    if (!channelReserveSupported) return

    await Promise.all([
      setupFeeToken(payerClient, { account: payee }),
      setupFeeToken(payerClient, { account: operator }),
    ])
  })

  test('open and getStates', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, descriptor, receipt } = await setupChannel()

    expect(receipt.status).toBe('success')
    expect(channelId).toBe(
      Channel.computeId({
        ...descriptor,
        chainId: chain.id,
      }),
    )

    const stateById = await actions.channel.getStates(payerClient, {
      channel: channelId,
    })
    const stateByDescriptor = await actions.channel.getStates(payerClient, {
      channel: descriptor,
    })
    const states = await actions.channel.getStates(payerClient, {
      channel: [channelId, descriptor, zeroHash],
    })

    expect(stateById).toEqual({
      closeRequestedAt: 0,
      deposit: parseUnits('100', 6),
      settled: 0n,
    })
    expect(stateByDescriptor).toEqual(stateById)
    expect(states).toEqual([
      stateById,
      stateById,
      { closeRequestedAt: 0, deposit: 0n, settled: 0n },
    ])
  })

  test('settle', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, descriptor, token } = await setupChannel()
    const payeeBalance = await actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    const signature = await signVoucher({
      channelId,
      cumulativeAmount: parseUnits('40', 6),
    })

    const { receipt, ...settled } = await actions.channel.settleSync(
      operatorClient,
      {
        cumulativeAmount: parseUnits('40', 6),
        descriptor,
        signature,
      },
    )

    expect(receipt.status).toBe('success')
    expect(settled).toMatchObject({
      channelId,
      cumulativeAmount: parseUnits('40', 6),
      deltaPaid: parseUnits('40', 6),
      newSettled: parseUnits('40', 6),
      payee: payee.address,
      payer: payer.address,
    })

    const state = await actions.channel.getStates(payerClient, {
      channel: descriptor,
    })
    expect(state).toEqual({
      closeRequestedAt: 0,
      deposit: parseUnits('100', 6),
      settled: parseUnits('40', 6),
    })
    await expectTokenBalance(token, payee.address, payeeBalance, '40')
  })

  test('topUp', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, descriptor } = await setupChannel()

    await actions.channel.requestCloseSync(payerClient, {
      descriptor,
    })
    const requestedState = await actions.channel.getStates(payerClient, {
      channel: descriptor,
    })
    expect(requestedState.closeRequestedAt).toBeGreaterThan(0)

    const { receipt, ...topUp } = await actions.channel.topUpSync(payerClient, {
      additionalDeposit: parseUnits('25', 6),
      descriptor,
    })

    expect(receipt.status).toBe('success')
    expect(topUp).toMatchObject({
      additionalDeposit: parseUnits('25', 6),
      channelId,
      newDeposit: parseUnits('125', 6),
      payee: payee.address,
      payer: payer.address,
    })

    const state = await actions.channel.getStates(payerClient, {
      channel: channelId,
    })
    expect(state).toEqual({
      closeRequestedAt: 0,
      deposit: parseUnits('125', 6),
      settled: 0n,
    })
  })

  test('close', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, descriptor, token } = await setupChannel()
    const payerBalance = await actions.token.getBalance(payerClient, {
      account: payer.address,
      token,
    })
    const payeeBalance = await actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    const signature = await signVoucher({
      channelId,
      cumulativeAmount: parseUnits('80', 6),
    })

    const { receipt, ...closed } = await actions.channel.closeSync(
      operatorClient,
      {
        captureAmount: parseUnits('40', 6),
        cumulativeAmount: parseUnits('80', 6),
        descriptor,
        signature,
      },
    )

    expect(receipt.status).toBe('success')
    expect(closed).toMatchObject({
      channelId,
      payee: payee.address,
      payer: payer.address,
      refundedToPayer: parseUnits('60', 6),
      settledToPayee: parseUnits('40', 6),
    })

    const state = await actions.channel.getStates(payerClient, {
      channel: descriptor,
    })
    expect(state).toEqual({
      closeRequestedAt: 0,
      deposit: 0n,
      settled: 0n,
    })
    await expectTokenBalance(token, payer.address, payerBalance, '60')
    await expectTokenBalance(token, payee.address, payeeBalance, '40')
  })

  test('requestClose and withdraw', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, descriptor } = await setupChannel()

    const { receipt, ...closeRequested } =
      await actions.channel.requestCloseSync(payerClient, {
        descriptor,
      })

    expect(receipt.status).toBe('success')
    expect(closeRequested).toMatchObject({
      channelId,
      payee: payee.address,
      payer: payer.address,
    })
    expect(closeRequested.closeGraceEnd).toBeGreaterThan(0n)

    const state = await actions.channel.getStates(payerClient, {
      channel: channelId,
    })
    expect(state.closeRequestedAt).toBeGreaterThan(0)

    await expect(
      actions.channel.withdrawSync(payerClient, {
        descriptor,
      }),
    ).rejects.toThrow('The contract function "withdraw" reverted')

    const { blocks } = await actions.simulate.simulateBlocks(payerClient, {
      blocks: [
        {
          blockOverrides: {
            time: closeRequested.closeGraceEnd,
          },
          calls: [actions.channel.withdraw.call({ descriptor })],
        },
      ],
    })

    expect(blocks[0].calls[0]).toMatchObject({
      result: null,
      status: 'success',
    })
  })
})

async function setupChannel() {
  tokenId += 1
  const { token } = await setupToken(payerClient, {
    name: `Channel Test ${tokenId}`,
    symbol: `CHT${tokenId}`,
  })
  const salt = Hex.random(32)
  const deposit = parseUnits('100', 6)
  const { receipt, ...opened } = await actions.channel.openSync(payerClient, {
    authorizedSigner: zeroAddress,
    deposit,
    operator: operator.address,
    payee: payee.address,
    salt,
    token,
  })
  const descriptor = {
    authorizedSigner: opened.authorizedSigner,
    expiringNonceHash: opened.expiringNonceHash,
    operator: opened.operator,
    payee: opened.payee,
    payer: opened.payer,
    salt: opened.salt,
    token: opened.token,
  } as const satisfies Channel.Descriptor

  return {
    ...opened,
    descriptor,
    receipt,
    token,
  }
}

async function supportsChannelReserve() {
  const schedule = (await payerClient.request({
    method: 'tempo_forkSchedule',
  } as never)) as {
    schedule: readonly { active: boolean; name: string }[]
  }
  return schedule.schedule.some((fork) => {
    if (!fork.active) return false
    const match = fork.name.match(/^T(\d+)$/)
    return match ? Number(match[1]) >= 5 : false
  })
}

async function signVoucher(parameters: {
  channelId: Hex.Hex
  cumulativeAmount: bigint
}) {
  const { channelId, cumulativeAmount } = parameters
  return payer.sign({
    hash: Channel.getVoucherSignPayload({
      chainId: chain.id,
      channelId,
      cumulativeAmount,
    }),
  })
}

async function expectTokenBalance(
  token: Address,
  account: Address,
  balanceBefore: bigint,
  amount: string,
) {
  const balanceAfter = await actions.token.getBalance(payerClient, {
    account,
    token,
  })
  expect(balanceAfter).toBe(balanceBefore + parseUnits(amount, 6))
}
