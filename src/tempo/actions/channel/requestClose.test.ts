import { Value } from 'ox'
import { Channel } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions as CoreActions } from 'viem'
import { Account, Actions } from 'viem/tempo'

const payer = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const payee = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const operator = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account: payer, feeToken: tempo.pathUsd })

describe('requestClose', () => {
  test('requestClose and withdraw', async () => {
    const { channelId, channel } = await setupChannel()

    const { receipt, ...closeRequested } =
      await Actions.channel.requestCloseSync(client, {
        channel,
      })

    expect(receipt.status).toBe('success')
    expect(closeRequested).toMatchObject({
      channelId,
      payee: payee.address,
      payer: payer.address,
    })
    expect(closeRequested.closeGraceEnd).toBeGreaterThan(0n)

    const state = await Actions.channel.getStates(client, {
      channel: channelId,
    })
    expect(state.closeRequestedAt).toBeGreaterThan(0)

    await expect(
      Actions.channel.withdrawSync(client, {
        channel,
      }),
    ).rejects.toThrow('The contract function "withdraw" reverted')

    // Core `block.simulate` takes the sender per call (the tempo `simulate`
    // namespace, which defaults it to the client account, lands separately).
    const [block] = await CoreActions.block.simulate(client, {
      blocks: [
        {
          blockOverrides: {
            time: closeRequested.closeGraceEnd,
          },
          calls: [
            { ...Actions.channel.withdraw.call({ channel }), account: payer },
          ],
        },
      ],
    })

    const [call] = block.calls
    expect(call).toMatchObject({
      result: null,
      status: 'success',
    })
    expect(call.logs).toBeDefined()

    const { args } = Actions.channel.withdraw.extractEvent(call.logs!)
    expect(args).toMatchObject({
      channelId,
      payee: payee.address,
      payer: payer.address,
      refundedToPayer: Value.from('100', 6),
      settledToPayee: 0n,
    })
  })
})

async function setupChannel() {
  const { receipt, ...opened } = await Actions.channel.openSync(client, {
    deposit: Value.from('100', 6),
    operator: operator.address,
    payee: payee.address,
    salt: '0x0000000000000000000000000000000000000000000000000000000000000701',
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
