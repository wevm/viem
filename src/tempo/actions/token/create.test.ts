import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions as CoreActions } from 'viem'
import { Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })

describe('create', () => {
  test('default', async () => {
    const { receipt, salt, token, ...result } = await Actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Test USD',
        symbol: 'TUSD',
      },
    )

    expect(result).toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "currency": "USD",
        "name": "Test USD",
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "symbol": "TUSD",
      }
    `)
    expect(salt).toBeDefined()
    expect(token).toBeDefined()
    expect(receipt.status).toBe('success')

    const code = await CoreActions.address.getCode(client, { address: token })
    expect(code).toBe('0xef')
  })
})
