import type { Hex } from 'ox'
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

    const { channelId, channel, receipt } = await setupChannel()

    expect(receipt.status).toBe('success')
    expect(channelId).toBe(Channel.computeId(channel, { chainId: chain.id }))

    const stateById = await actions.channel.getStates(payerClient, {
      channel: channelId,
    })
    const stateByChannel = await actions.channel.getStates(payerClient, {
      channel,
    })
    const states = await actions.channel.getStates(payerClient, {
      channel: [channelId, channel, zeroHash],
    })

    expect(stateById).toEqual({
      closeRequestedAt: 0,
      deposit: parseUnits('100', 6),
      settled: 0n,
    })
    expect(stateByChannel).toEqual(stateById)
    expect(states).toEqual([
      stateById,
      stateById,
      { closeRequestedAt: 0, deposit: 0n, settled: 0n },
    ])
  })

  test('behavior: open defaults', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    tokenId += 1
    const { token } = await setupToken(payerClient, {
      name: `Channel Test ${tokenId}`,
      symbol: `CHT${tokenId}`,
    })
    const { receipt, ...opened } = await actions.channel.openSync(payerClient, {
      deposit: parseUnits('100', 6),
      payee: payee.address,
      token,
    })

    expect(receipt.status).toBe('success')
    expect(opened.authorizedSigner).toBe(zeroAddress)
    expect(opened.operator).toBe(zeroAddress)
    expect(opened.salt).toMatch(/^0x[0-9a-fA-F]{64}$/)
  })

  test('behavior: explicit salt', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    tokenId += 1
    const { token } = await setupToken(payerClient, {
      name: `Channel Test ${tokenId}`,
      symbol: `CHT${tokenId}`,
    })
    const { receipt, ...opened } = await actions.channel.openSync(payerClient, {
      deposit: parseUnits('100', 6),
      payee: payee.address,
      salt: zeroHash,
      token,
    })
    const channel = Channel.from({
      authorizedSigner: opened.authorizedSigner,
      expiringNonceHash: opened.expiringNonceHash,
      operator: opened.operator,
      payee: opened.payee,
      payer: opened.payer,
      salt: opened.salt,
      token: opened.token,
    })

    expect(receipt.status).toBe('success')
    expect(opened.salt).toBe(zeroHash)
    expect(opened.channelId).toBe(
      Channel.computeId(channel, { chainId: chain.id }),
    )
  })

  test('settle', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, channel, token } = await setupChannel()
    const payeeBalance = await actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    const signature = await signVoucher({
      channel: channelId,
      cumulativeAmount: parseUnits('40', 6),
    })

    const { receipt, ...settled } = await actions.channel.settleSync(
      operatorClient,
      {
        cumulativeAmount: parseUnits('40', 6),
        channel,
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
      channel,
    })
    expect(state).toEqual({
      closeRequestedAt: 0,
      deposit: parseUnits('100', 6),
      settled: parseUnits('40', 6),
    })
    const payeeBalanceAfter = await actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    expect(payeeBalanceAfter).toBe(payeeBalance + parseUnits('40', 6))
  })

  test('signVoucher', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, channel } = await setupChannel()
    const cumulativeAmount = parseUnits('40', 6)

    const signature = await actions.channel.signVoucher(payerClient, {
      channel,
      cumulativeAmount,
    })
    const signatureById = await actions.channel.signVoucher(payerClient, {
      channel: channelId,
      cumulativeAmount,
    })

    expect(signature).toBe(signatureById)
    expect(signature).toBe(
      await payer.signVoucher({
        chainId: chain.id,
        channel: channelId,
        cumulativeAmount,
      }),
    )
  })

  test('topUp', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, channel } = await setupChannel()

    await actions.channel.requestCloseSync(payerClient, {
      channel,
    })
    const requestedState = await actions.channel.getStates(payerClient, {
      channel,
    })
    expect(requestedState.closeRequestedAt).toBeGreaterThan(0)

    const { receipt, ...topUp } = await actions.channel.topUpSync(payerClient, {
      additionalDeposit: parseUnits('25', 6),
      channel,
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

    const { channelId, channel, token } = await setupChannel()
    const payerBalance = await actions.token.getBalance(payerClient, {
      account: payer.address,
      token,
    })
    const payeeBalance = await actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    const signature = await signVoucher({
      channel: channelId,
      cumulativeAmount: parseUnits('80', 6),
    })

    const { receipt, ...closed } = await actions.channel.closeSync(
      operatorClient,
      {
        captureAmount: parseUnits('40', 6),
        cumulativeAmount: parseUnits('80', 6),
        channel,
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
      channel,
    })
    expect(state).toEqual({
      closeRequestedAt: 0,
      deposit: 0n,
      settled: 0n,
    })
    const payerBalanceAfter = await actions.token.getBalance(payerClient, {
      account: payer.address,
      token,
    })
    expect(payerBalanceAfter).toBe(payerBalance + parseUnits('60', 6))

    const payeeBalanceAfter = await actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    expect(payeeBalanceAfter).toBe(payeeBalance + parseUnits('40', 6))
  })

  test('requestClose and withdraw', async (ctx) => {
    if (!channelReserveSupported) ctx.skip()

    const { channelId, channel } = await setupChannel()

    const { receipt, ...closeRequested } =
      await actions.channel.requestCloseSync(payerClient, {
        channel,
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
        channel,
      }),
    ).rejects.toThrow('The contract function "withdraw" reverted')

    const { blocks } = await actions.simulate.simulateBlocks(payerClient, {
      blocks: [
        {
          blockOverrides: {
            time: closeRequested.closeGraceEnd,
          },
          calls: [actions.channel.withdraw.call({ channel })],
        },
      ],
    })

    const call = blocks[0].calls[0]
    expect(call).toMatchObject({
      result: null,
      status: 'success',
    })
    expect(call.logs).toBeDefined()

    const { args } = actions.channel.withdraw.extractEvent(call.logs!)
    expect(args).toMatchObject({
      channelId,
      payee: payee.address,
      payer: payer.address,
      refundedToPayer: parseUnits('100', 6),
      settledToPayee: 0n,
    })
  })
})

async function setupChannel() {
  tokenId += 1
  const { token } = await setupToken(payerClient, {
    name: `Channel Test ${tokenId}`,
    symbol: `CHT${tokenId}`,
  })
  const deposit = parseUnits('100', 6)
  const { receipt, ...opened } = await actions.channel.openSync(payerClient, {
    deposit,
    operator: operator.address,
    payee: payee.address,
    token,
  })
  const channel = Channel.from({
    authorizedSigner: opened.authorizedSigner,
    expiringNonceHash: opened.expiringNonceHash,
    operator: opened.operator,
    payee: opened.payee,
    payer: opened.payer,
    salt: opened.salt,
    token: opened.token,
  })

  return {
    ...opened,
    channel,
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
  channel: Hex.Hex
  cumulativeAmount: bigint
}) {
  const { channel, cumulativeAmount } = parameters
  return payer.signVoucher({
    chainId: chain.id,
    channel,
    cumulativeAmount,
  })
}
