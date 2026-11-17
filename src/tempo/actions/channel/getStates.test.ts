import { Value } from 'ox'
import { Channel } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const payer = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const payee = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const operator = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account: payer, feeToken: tempo.pathUsd })

describe('getStates', () => {
  test('open and getStates', async () => {
    const { channelId, channel, receipt } = await setupChannel()

    expect(receipt.status).toBe('success')
    expect(channelId).toBe(
      Channel.computeId(channel, { chainId: client.chain!.id }),
    )

    const stateById = await Actions.channel.getStates(client, {
      channel: channelId,
    })
    const stateByChannel = await Actions.channel.getStates(client, {
      channel,
    })
    const states = await Actions.channel.getStates(client, {
      channel: [
        channelId,
        channel,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
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

    expect(
      Actions.channel.getStates.call({ channel: channelId }).functionName,
    ).toBe('getChannelState')
    expect(
      Actions.channel.getStates.call({
        chainId: client.chain!.id,
        channel: [channel],
      }).functionName,
    ).toBe('getChannelStatesBatch')
    expect(() => Actions.channel.getStates.call({ channel })).toThrowError(
      '`chainId` is required for channel inputs.',
    )
  })
})

async function setupChannel() {
  const { receipt, ...opened } = await Actions.channel.openSync(client, {
    deposit: Value.from('100', 6),
    operator: operator.address,
    payee: payee.address,
    salt: '0x0000000000000000000000000000000000000000000000000000000000000201',
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
