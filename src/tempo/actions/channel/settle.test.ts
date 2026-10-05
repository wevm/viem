import { Value } from 'ox'
import { Channel } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const payer = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const payee = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const operator = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const payerClient = tempo.getClient({ account: payer, feeToken: tempo.pathUsd })
const operatorClient = tempo.getClient({
  account: operator,
  feeToken: tempo.pathUsd,
})

describe('settle', () => {
  test('settle', async () => {
    const { channelId, channel, token } = await setupChannel()
    const payeeBalance = await Actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    const signature = await Account.signVoucher(payer, {
      chainId: payerClient.chain!.id,
      channel: channelId,
      cumulativeAmount: Value.from('40', 6),
    })

    const { receipt, ...settled } = await Actions.channel.settleSync(
      operatorClient,
      {
        cumulativeAmount: Value.from('40', 6),
        channel,
        signature,
      },
    )

    expect(receipt.status).toBe('success')
    // The channel id embeds the open transaction's expiring nonce hash, so it
    // is nondeterministic across runs.
    const { channelId: settledChannelId, ...rest } = settled
    expect(settledChannelId).toBe(channelId)
    expect(rest).toMatchInlineSnapshot(`
      {
        "cumulativeAmount": 40000000n,
        "deltaPaid": 40000000n,
        "newSettled": 40000000n,
        "payee": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "payer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(
      await Actions.channel.getStates(payerClient, {
        channel,
      }),
    ).toMatchInlineSnapshot(`
      {
        "closeRequestedAt": 0,
        "deposit": 100000000n,
        "settled": 40000000n,
      }
    `)
    const payeeBalanceAfter = await Actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    expect(payeeBalanceAfter.amount).toBe(
      payeeBalance.amount + Value.from('40', 6),
    )
  })
})

async function setupChannel() {
  const { receipt, ...opened } = await Actions.channel.openSync(payerClient, {
    deposit: Value.from('100', 6),
    operator: operator.address,
    payee: payee.address,
    salt: '0x0000000000000000000000000000000000000000000000000000000000000301',
    token: tempo.alphaUsd,
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

  return { ...opened, channel, receipt }
}
