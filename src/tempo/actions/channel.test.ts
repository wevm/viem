import * as tempo from '~test/tempo.js'
import type * as Address from 'ox/Address'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import { describe, expect, test } from 'vitest'

import { Account, Actions as CoreActions } from 'viem'
import { Actions, Channel } from 'viem/tempo'

const client = tempo.getClient()
const operatorClient = tempo.getClient({
  account: Account.fromPrivateKey(tempo.accounts[2].privateKey),
})

const payer = tempo.accounts[0]
const payee = tempo.accounts[1]
const operator = tempo.accounts[2]

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

/** Funds `to` with alphaUSD for fee payment. */
async function fund(to: Address.Address) {
  await Actions.token.transferSync(client, {
    amount: 10_000_000n,
    feeToken: tempo.alphaUsd,
    to,
    token: tempo.alphaUsd,
  } as never)
}

/** Opens an operator-enabled alphaUSD channel from account 0 to account 1. */
async function setupChannel() {
  const { receipt, ...opened } = await Actions.channel.openSync(client, {
    deposit: 100_000_000n,
    feeToken: tempo.alphaUsd,
    operator: operator.address,
    payee: payee.address,
    token: tempo.alphaUsd,
  } as never)
  const channel = Channel.from({
    authorizedSigner: opened.authorizedSigner,
    expiringNonceHash: opened.expiringNonceHash,
    operator: opened.operator,
    payee: opened.payee,
    payer: opened.payer,
    salt: opened.salt,
    token: opened.token,
  })
  return { ...opened, channel, receipt }
}

describe('open', () => {
  test('default', async () => {
    const { channel, channelId, expiringNonceHash, receipt, salt, ...opened } =
      await setupChannel()

    expect(receipt.status).toBe('success')
    expect(salt).toMatch(/^0x[0-9a-fA-F]{64}$/)
    expect(expiringNonceHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
    expect(channelId).toBe(
      Channel.computeId(channel, { chainId: client.chain.id }),
    )
    expect(opened).toMatchInlineSnapshot(`
      {
        "authorizedSigner": "0x0000000000000000000000000000000000000000",
        "deposit": 100000000n,
        "operator": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "token": "0x20C0000000000000000000000000000000000001",
      }
    `)
  })

  test('behavior: defaults', async () => {
    const { receipt, ...opened } = await Actions.channel.openSync(client, {
      deposit: 100_000_000n,
      feeToken: tempo.alphaUsd,
      payee: payee.address,
      token: tempo.alphaUsd,
    } as never)

    expect(receipt.status).toBe('success')
    expect(opened.authorizedSigner).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000"`,
    )
    expect(opened.operator).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000"`,
    )
    expect(opened.salt).toMatch(/^0x[0-9a-fA-F]{64}$/)
  })

  test('behavior: explicit salt', async () => {
    const { receipt, ...opened } = await Actions.channel.openSync(client, {
      deposit: 100_000_000n,
      feeToken: tempo.alphaUsd,
      payee: payee.address,
      salt: zeroHash,
      token: tempo.alphaUsd,
    } as never)
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
      Channel.computeId(channel, { chainId: client.chain.id }),
    )
  })
})

describe('getStates', () => {
  test('default', async () => {
    const { channel, channelId } = await setupChannel()

    const stateById = await Actions.channel.getStates(client, {
      channel: channelId,
    })
    const stateByChannel = await Actions.channel.getStates(client, {
      channel,
    })
    const states = await Actions.channel.getStates(client, {
      channel: [channelId, channel, zeroHash],
    })

    expect(stateById).toMatchInlineSnapshot(`
      {
        "closeRequestedAt": 0,
        "deposit": 100000000n,
        "settled": 0n,
      }
    `)
    expect(stateByChannel).toEqual(stateById)
    expect(states).toMatchInlineSnapshot(`
      [
        {
          "closeRequestedAt": 0,
          "deposit": 100000000n,
          "settled": 0n,
        },
        {
          "closeRequestedAt": 0,
          "deposit": 100000000n,
          "settled": 0n,
        },
        {
          "closeRequestedAt": 0,
          "deposit": 0n,
          "settled": 0n,
        },
      ]
    `)
  })
})

describe('signVoucher', () => {
  test('default', async () => {
    const { channel, channelId } = await setupChannel()

    const signature = await Actions.channel.signVoucher(client, {
      channel,
      cumulativeAmount: 40_000_000n,
    })
    const signatureById = await Actions.channel.signVoucher(client, {
      channel: channelId,
      cumulativeAmount: 40_000_000n,
    })

    expect(signatureById).toBe(signature)
    expect(
      Secp256k1.recoverAddress({
        payload: Channel.getVoucherSignPayload({
          chainId: client.chain.id,
          channelId,
          cumulativeAmount: 40_000_000n,
        }),
        signature: Signature.fromHex(signature),
      }).toLowerCase(),
    ).toBe(payer.address)
  })
})

describe('settle', () => {
  test('default', async () => {
    const { channel, channelId } = await setupChannel()
    await fund(operator.address)

    const payeeBalance = await Actions.token.getBalance(client, {
      account: payee.address,
      token: tempo.alphaUsd,
    })
    const signature = await Actions.channel.signVoucher(client, {
      channel,
      cumulativeAmount: 40_000_000n,
    })

    const {
      channelId: settledChannelId,
      receipt,
      ...settled
    } = await Actions.channel.settleSync(operatorClient, {
      channel,
      cumulativeAmount: 40_000_000n,
      feeToken: tempo.alphaUsd,
      signature,
    } as never)

    expect(receipt.status).toBe('success')
    expect(settledChannelId).toBe(channelId)
    expect(settled).toMatchInlineSnapshot(`
      {
        "cumulativeAmount": 40000000n,
        "deltaPaid": 40000000n,
        "newSettled": 40000000n,
        "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(Actions.channel.getStates(client, { channel })).resolves
      .toMatchInlineSnapshot(`
      {
        "closeRequestedAt": 0,
        "deposit": 100000000n,
        "settled": 40000000n,
      }
    `)

    const payeeBalanceAfter = await Actions.token.getBalance(client, {
      account: payee.address,
      token: tempo.alphaUsd,
    })
    expect(payeeBalanceAfter.amount).toBe(payeeBalance.amount + 40_000_000n)
  })
})

describe('topUp', () => {
  test('default', async () => {
    const { channel, channelId } = await setupChannel()

    await Actions.channel.requestCloseSync(client, {
      channel,
      feeToken: tempo.alphaUsd,
    } as never)
    const requested = await Actions.channel.getStates(client, { channel })
    expect(requested.closeRequestedAt).toBeGreaterThan(0)

    const {
      channelId: topUpChannelId,
      receipt,
      ...topUp
    } = await Actions.channel.topUpSync(client, {
      additionalDeposit: 25_000_000n,
      channel,
      feeToken: tempo.alphaUsd,
    } as never)

    expect(receipt.status).toBe('success')
    expect(topUpChannelId).toBe(channelId)
    expect(topUp).toMatchInlineSnapshot(`
      {
        "additionalDeposit": 25000000n,
        "newDeposit": 125000000n,
        "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Topping up cancels a pending close request.
    await expect(Actions.channel.getStates(client, { channel: channelId }))
      .resolves.toMatchInlineSnapshot(`
      {
        "closeRequestedAt": 0,
        "deposit": 125000000n,
        "settled": 0n,
      }
    `)
  })
})

describe('requestClose', () => {
  test('default', async () => {
    const { channel, channelId } = await setupChannel()

    const {
      channelId: requestedChannelId,
      closeGraceEnd,
      receipt,
      ...requested
    } = await Actions.channel.requestCloseSync(client, {
      channel,
      feeToken: tempo.alphaUsd,
    } as never)

    expect(receipt.status).toBe('success')
    expect(requestedChannelId).toBe(channelId)
    expect(closeGraceEnd).toBeGreaterThan(0n)
    expect(requested).toMatchInlineSnapshot(`
      {
        "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const state = await Actions.channel.getStates(client, {
      channel: channelId,
    })
    expect(state.closeRequestedAt).toBeGreaterThan(0)
    expect(closeGraceEnd).toBe(
      BigInt(state.closeRequestedAt) + Channel.closeGracePeriod,
    )
  })
})

describe('close', () => {
  test('default', async () => {
    const { channel, channelId } = await setupChannel()
    await fund(operator.address)

    const payerBalance = await Actions.token.getBalance(client, {
      account: payer.address,
      token: tempo.alphaUsd,
    })
    const payeeBalance = await Actions.token.getBalance(client, {
      account: payee.address,
      token: tempo.alphaUsd,
    })
    const signature = await Actions.channel.signVoucher(client, {
      channel,
      cumulativeAmount: 80_000_000n,
    })

    const {
      channelId: closedChannelId,
      receipt,
      ...closed
    } = await Actions.channel.closeSync(operatorClient, {
      captureAmount: 40_000_000n,
      channel,
      cumulativeAmount: 80_000_000n,
      feeToken: tempo.alphaUsd,
      signature,
    } as never)

    expect(receipt.status).toBe('success')
    expect(closedChannelId).toBe(channelId)
    expect(closed).toMatchInlineSnapshot(`
      {
        "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "refundedToPayer": 60000000n,
        "settledToPayee": 40000000n,
      }
    `)

    await expect(Actions.channel.getStates(client, { channel })).resolves
      .toMatchInlineSnapshot(`
      {
        "closeRequestedAt": 0,
        "deposit": 0n,
        "settled": 0n,
      }
    `)

    const payerBalanceAfter = await Actions.token.getBalance(client, {
      account: payer.address,
      token: tempo.alphaUsd,
    })
    expect(payerBalanceAfter.amount).toBe(payerBalance.amount + 60_000_000n)

    const payeeBalanceAfter = await Actions.token.getBalance(client, {
      account: payee.address,
      token: tempo.alphaUsd,
    })
    expect(payeeBalanceAfter.amount).toBe(payeeBalance.amount + 40_000_000n)
  })
})

describe('withdraw', () => {
  test('default', async () => {
    const { channel, channelId } = await setupChannel()

    const { closeGraceEnd } = await Actions.channel.requestCloseSync(client, {
      channel,
      feeToken: tempo.alphaUsd,
    } as never)

    // The grace period has not elapsed yet.
    await expect(
      Actions.channel.withdrawSync(client, {
        channel,
        feeToken: tempo.alphaUsd,
      } as never),
    ).rejects.toThrow('error CloseNotReady()')

    const blocks = await CoreActions.block.simulate(client, {
      blocks: [
        {
          blockOverrides: { time: closeGraceEnd },
          calls: [
            {
              ...Actions.channel.withdraw.call({ channel }),
              account: client.account!.address,
            },
          ],
        },
      ],
    })

    const call = blocks[0]!.calls[0]!
    expect(call).toMatchObject({ result: null, status: 'success' })
    expect(call.logs).toBeDefined()

    const { args } = Actions.channel.withdraw.extractEvent(call.logs!)
    const { channelId: withdrawnChannelId, ...withdrawn } = args
    expect(withdrawnChannelId).toBe(channelId)
    expect(withdrawn).toMatchInlineSnapshot(`
      {
        "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "refundedToPayer": 100000000n,
        "settledToPayee": 0n,
      }
    `)
  })
})
