import { Value } from 'ox'
import { Channel } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const payer = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const payee = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const operator = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account: payer, feeToken: tempo.pathUsd })

describe('topUp', () => {
  test('topUp', async () => {
    const { channelId, channel } = await setupChannel()

    await Actions.channel.requestCloseSync(client, {
      channel,
    })
    const requestedState = await Actions.channel.getStates(client, {
      channel,
    })
    expect(requestedState.closeRequestedAt).toBeGreaterThan(0)

    const { receipt, ...topUp } = await Actions.channel.topUpSync(client, {
      additionalDeposit: Value.from('25', 6),
      channel,
    })

    expect(receipt.status).toBe('success')
    expect(topUp).toMatchObject({
      additionalDeposit: Value.from('25', 6),
      channelId,
      newDeposit: Value.from('125', 6),
      payee: payee.address,
      payer: payer.address,
    })

    expect(
      await Actions.channel.getStates(client, {
        channel: channelId,
      }),
    ).toMatchInlineSnapshot(`
      {
        "closeRequestedAt": 0,
        "deposit": 125000000n,
        "settled": 0n,
      }
    `)
  })
})

async function setupChannel() {
  const { receipt, ...opened } = await Actions.channel.openSync(client, {
    deposit: Value.from('100', 6),
    operator: operator.address,
    payee: payee.address,
    salt: '0x0000000000000000000000000000000000000000000000000000000000000501',
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
