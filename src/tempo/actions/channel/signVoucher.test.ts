import { Value } from 'ox'
import { Channel } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const payer = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const payee = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const operator = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const payerClient = tempo.getClient({ account: payer, feeToken: tempo.pathUsd })

describe('signVoucher', () => {
  test('signVoucher', async () => {
    const { channelId, channel } = await setupChannel()
    const cumulativeAmount = Value.from('40', 6)

    const signature = await Actions.channel.signVoucher(payerClient, {
      channel,
      cumulativeAmount,
    })
    const signatureById = await Actions.channel.signVoucher(payerClient, {
      channel: channelId,
      cumulativeAmount,
    })

    expect(signature).toBe(signatureById)
    expect(signature).toBe(
      await Account.signVoucher(payer, {
        chainId: payerClient.chain!.id,
        channel: channelId,
        cumulativeAmount,
      }),
    )
  })
})

async function setupChannel() {
  const { receipt, ...opened } = await Actions.channel.openSync(payerClient, {
    deposit: Value.from('100', 6),
    operator: operator.address,
    payee: payee.address,
    salt: '0x0000000000000000000000000000000000000000000000000000000000000401',
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
