import { beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  client,
  holder,
  mined,
  prepareAccount,
  usdc,
} from '~test/token.js'
import { mine } from '../test/mine.js'
import { approve } from './approve.js'
import { transferSync } from './transferSync.js'

const spender = accounts[6].address
const to = accounts[7].address

beforeAll(async () => {
  await prepareAccount(holder)
  await prepareAccount(spender)
})

describe('transferSync', () => {
  test('default: infers decimals from chain token', async () => {
    const { receipt, ...args } = await mined(
      transferSync(client, {
        account: holder,
        token: usdc,
        to,
        amount: '500',
      }),
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(args).toMatchInlineSnapshot(`
      {
        "decimals": 6,
        "formatted": "500",
        "from": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "to": "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        "value": 500000000n,
      }
    `)
  })

  test('token: resolves address + decimals from chain tokens', async () => {
    const { receipt, ...args } = await mined(
      transferSync(client, {
        account: holder,
        token: 'usdc',
        to,
        amount: '500',
      }),
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(args).toMatchInlineSnapshot(`
      {
        "decimals": 6,
        "formatted": "500",
        "from": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "to": "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        "value": 500000000n,
      }
    `)
  })
})

describe('transferSync: from (allowance)', () => {
  test('default', async () => {
    await approve(client, {
      account: holder,
      token: usdc,
      spender,
      amount: '750',
    })
    await mine(client, { blocks: 1 })

    const { receipt, ...args } = await mined(
      transferSync(client, {
        account: spender,
        token: usdc,
        from: holder,
        to,
        amount: '750',
      }),
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(args).toMatchInlineSnapshot(`
      {
        "decimals": 6,
        "formatted": "750",
        "from": "0x5414d89a8bF7E99d732BC52f3e6A3Ef461c0C078",
        "to": "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        "value": 750000000n,
      }
    `)
  })
})
