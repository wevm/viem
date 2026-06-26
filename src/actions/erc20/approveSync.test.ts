import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  client,
  decimals,
  holder,
  mined,
  prepareAccount,
  usdc,
} from '~test/erc20.js'
import { approveSync } from './approveSync.js'

const spender = accounts[3].address

beforeAll(async () => {
  await prepareAccount(holder)
})

describe('approveSync', () => {
  test('default', async () => {
    const { receipt, ...args } = await mined(
      approveSync(client, {
        account: holder,
        token: usdc,
        spender,
        amount: '250',
        decimals,
      }),
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(args).toMatchInlineSnapshot(`
      {
        "decimals": 6,
        "formatted": "250",
        "owner": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "spender": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "value": 250000000n,
      }
    `)
  })

  test('token: resolves address + decimals from chain tokens', async () => {
    const { receipt, ...args } = await mined(
      approveSync(client, {
        account: holder,
        token: 'usdc',
        spender: accounts[8].address,
        amount: '250',
      }),
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(args).toMatchInlineSnapshot(`
      {
        "decimals": 6,
        "formatted": "250",
        "owner": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "spender": "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
        "value": 250000000n,
      }
    `)
  })
})
