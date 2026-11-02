import { Value } from 'ox'
import { TokenRole } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })
const client3 = tempo.getClient({ account: account3, feeToken: tempo.pathUsd })

void TokenRole
void client2
void client3
void fund

async function fund(address: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: Value.from('1', 6),
    to: address,
    token: tempo.pathUsd,
  })
}

describe('updateQuoteToken', () => {
  test('default', async () => {
    const { token: quoteToken } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Quote Token',
      symbol: 'LINK',
    })
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Main Token',
      symbol: 'MAIN',
    })
    await Actions.token.prepareUpdateQuoteTokenSync(client, {
      quoteToken,
      token,
    })
    const { receipt, newQuoteToken, ...result } =
      await Actions.token.updateQuoteTokenSync(client, { token })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(newQuoteToken).toBe(quoteToken)
    expect(
      (await Actions.token.getMetadata(client, { token })).quoteToken,
    ).toBe(quoteToken)
  })

  test('behavior: requires admin role', async () => {
    const { token: quoteToken } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Quote Token 2',
      symbol: 'LINK2',
    })
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Restricted Token',
      symbol: 'RESTR',
    })
    await Actions.token.prepareUpdateQuoteTokenSync(client, {
      quoteToken,
      token,
    })
    await fund(account2.address)
    await expect(
      Actions.token.updateQuoteTokenSync(client2, { token }),
    ).rejects.toThrow()
  })

  test('behavior: prevents circular references', async () => {
    const { token: tokenB } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Token B',
      symbol: 'TKB',
    })
    const { token: tokenA } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Token A',
      quoteToken: tokenB,
      symbol: 'TKA',
    })
    await Actions.token.prepareUpdateQuoteTokenSync(client, {
      quoteToken: tokenA,
      token: tokenB,
    })
    await expect(
      Actions.token.updateQuoteTokenSync(client, { token: tokenB }),
    ).rejects.toThrow()
  })
})
