import * as Value from 'ox/Value'
import * as TokenId from 'ox/tempo/TokenId'
import * as TokenRole from 'ox/tempo/TokenRole'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })
const client3 = tempo.getClient({ account: account3, feeToken: tempo.pathUsd })

void TokenId
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

describe('prepareUpdateQuoteToken', () => {
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
    const { receipt, nextQuoteToken, ...result } =
      await Actions.token.prepareUpdateQuoteTokenSync(client, {
        quoteToken,
        token,
      })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(nextQuoteToken).toBe(quoteToken)
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
    await fund(account2.address)
    await expect(
      Actions.token.prepareUpdateQuoteTokenSync(client2, { quoteToken, token }),
    ).rejects.toThrow()
  })

  test('behavior: with token ID', async () => {
    const { token: quoteToken } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Quote Token 3',
      symbol: 'LINK3',
    })
    const { tokenId } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Main Token ID',
      symbol: 'MAINID',
    })
    const { receipt, nextQuoteToken } =
      await Actions.token.prepareUpdateQuoteTokenSync(client, {
        quoteToken,
        token: tokenId,
      })
    expect(receipt.status).toBe('success')
    expect(nextQuoteToken).toBe(quoteToken)
  })
})
