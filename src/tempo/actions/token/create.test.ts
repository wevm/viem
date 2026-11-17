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

  test('async', async () => {
    const hash = await Actions.token.create(client, {
      currency: 'USD',
      name: 'Async USD',
      salt: '0x0000000000000000000000000000000000000000000000000000000000000101',
      symbol: 'AUSD',
    })
    const receipt = await CoreActions.transaction.waitForReceipt(client, {
      hash,
    }).receipt

    expect(receipt.status).toBe('success')
    const { args } = Actions.token.create.extractEvent(receipt.logs)
    expect(args.name).toBe('Async USD')
    expect(args.symbol).toBe('AUSD')
  })

  test('estimateGas', async () => {
    const gas = await Actions.token.create.estimateGas(client, {
      admin: client.account!.address,
      currency: 'USD',
      name: 'Estimated USD',
      salt: '0x0000000000000000000000000000000000000000000000000000000000000102',
      symbol: 'EUSD',
    })

    expect(gas).toBeTypeOf('bigint')
    expect(gas).toBeGreaterThan(0n)
  })

  test('simulate', async () => {
    const { request, result } = await Actions.token.create.simulate(client, {
      currency: 'USD',
      logoURI: 'https://example.com/token.svg',
      name: 'Simulated USD',
      salt: '0x0000000000000000000000000000000000000000000000000000000000000103',
      symbol: 'SUSD',
    })

    expect(result).toBeTypeOf('string')
    expect(request.functionName).toBe('createToken')
  })

  test('extractEvent: throws when missing', () => {
    expect(() =>
      Actions.token.create.extractEvent([]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: \`TokenCreated\` event not found.]`,
    )
  })
})
