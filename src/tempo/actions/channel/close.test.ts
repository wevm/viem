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

describe('close', () => {
  test('close', async () => {
    const { channelId, channel, token } = await setupChannel()
    const payerBalance = await Actions.token.getBalance(payerClient, {
      account: payer.address,
      token,
    })
    const payeeBalance = await Actions.token.getBalance(payerClient, {
      account: payee.address,
      token,
    })
    const signature = await Account.signVoucher(payer, {
      chainId: payerClient.chain!.id,
      channel: channelId,
      cumulativeAmount: Value.from('80', 6),
    })

    const { receipt, ...closed } = await Actions.channel.closeSync(
      operatorClient,
      {
        captureAmount: Value.from('40', 6),
        cumulativeAmount: Value.from('80', 6),
        channel,
        signature,
      },
    )

    expect(receipt.status).toBe('success')
    expect(closed).toMatchObject({
      channelId,
      payee: payee.address,
      payer: payer.address,
      refundedToPayer: Value.from('60', 6),
      settledToPayee: Value.from('40', 6),
    })

    expect(
      await Actions.channel.getStates(payerClient, {
        channel,
      }),
    ).toMatchInlineSnapshot(`
      {
        "closeRequestedAt": 0,
        "deposit": 0n,
        "settled": 0n,
      }
    `)
    const payerBalanceAfter = await Actions.token.getBalance(payerClient, {
      account: payer.address,
      token,
    })
    expect(payerBalanceAfter.amount).toBe(
      payerBalance.amount + Value.from('60', 6),
    )

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
    salt: '0x0000000000000000000000000000000000000000000000000000000000000601',
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
