import { beforeAll, describe, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import {
  accounts,
  client,
  holder,
  mined,
  prepareAccount,
  usdc,
} from '~test/token.js'
import { createClient } from '../../clients/createClient.js'
import { approveSync } from './approveSync.js'

const spender = accounts[3].address
const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

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
        amount: 250000000n,
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
        amount: { formatted: '250' },
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

  test('amount: formats with nested decimals', async () => {
    const { receipt, ...args } = await mined(
      approveSync(client, {
        account: holder,
        token: dai,
        spender: accounts[9].address,
        amount: { decimals: 18, formatted: '1.5' },
      }),
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(args).toMatchInlineSnapshot(`
      {
        "decimals": 18,
        "formatted": "1.5",
        "owner": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "spender": "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        "value": 1500000000000000000n,
      }
    `)
  })

  test('decimals: omits formatting for an undeclared base-unit amount', async () => {
    const tokenless = createClient({
      ...anvilMainnet.clientConfig,
      chain: { ...anvilMainnet.chain, tokens: undefined },
    })
    const { receipt, ...args } = await mined(
      approveSync(tokenless, {
        account: holder,
        token: dai,
        spender,
        amount: 1n,
      }),
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(args).toMatchInlineSnapshot(`
      {
        "owner": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "spender": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "value": 1n,
      }
    `)
  })
})
