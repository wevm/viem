import * as Channel from 'ox/tempo/Channel'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const payer = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const payee = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const operator = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account: payer, feeToken: tempo.pathUsd })

describe('open', () => {
  test('behavior: open defaults', async () => {
    const { receipt, ...opened } = await Actions.channel.openSync(client, {
      deposit: Value.from('100', 6),
      payee: payee.address,
      salt: '0x0000000000000000000000000000000000000000000000000000000000000101',
      token: tempo.alphaUsd,
    })

    expect(receipt.status).toBe('success')
    expect(opened.authorizedSigner).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000"`,
    )
    expect(opened.operator).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000"`,
    )
    expect(opened.salt).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000101"`,
    )
  })

  test('behavior: explicit salt', async () => {
    const { receipt, ...opened } = await Actions.channel.openSync(client, {
      deposit: Value.from('100', 6),
      operator: operator.address,
      payee: payee.address,
      salt: '0x0000000000000000000000000000000000000000000000000000000000000102',
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

    expect(receipt.status).toBe('success')
    expect(opened.salt).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000102"`,
    )
    expect(opened.channelId).toBe(
      Channel.computeId(channel, { chainId: client.chain!.id }),
    )
  })
})
