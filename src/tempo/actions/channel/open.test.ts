import { Value } from 'ox'
import { Channel } from 'ox/tempo'
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

  test('behavior: root authorized signer keeps a random default salt', async () => {
    const { receipt, ...opened } = await Actions.channel.openSync(client, {
      authorizedSigner: operator,
      deposit: Value.from('1', 6),
      payee: payee.address,
      token: tempo.alphaUsd,
    })

    expect(receipt.status).toBe('success')
    expect(opened.authorizedSigner).toBe(operator.address)
    expect(opened.salt).toMatch(/^0x[0-9a-f]{64}$/)
  })
})

describe('open.call', () => {
  test('behavior: makes no request and keeps a random default salt', () => {
    const options = {
      deposit: Value.from('1', 6),
      payee: payee.address,
      token: tempo.alphaUsd,
    } as const

    const [, , , , salt] = Actions.channel.open.call(options).args
    const [, , , , explicit] = Actions.channel.open.call({
      ...options,
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
    }).args

    expect(salt).toMatch(/^0x[0-9a-f]{64}$/)
    expect(explicit).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000000"`,
    )
  })
})
