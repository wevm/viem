import { describe, expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { usdc } from '../../tokens/definitions/usdc.js'
import { publicActions } from './public.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const clientWithTokens = createClient({
  account,
  chain: mainnet,
  tokens: { usdc },
  transport: http(),
})

describe('token', () => {
  const extended = clientWithTokens.extend(publicActions)

  test('attaches read token actions', () => {
    expectTypeOf(extended).toHaveProperty('token')
    expectTypeOf(extended.token.getAllowance).toBeFunction()
    expectTypeOf(extended.token.getBalance).toBeFunction()
    expectTypeOf(extended.token.getMetadata).toBeFunction()
    expectTypeOf(extended.token.getTotalSupply).toBeFunction()
  })

  test('selects by `token` name', () => {
    extended.token.getAllowance({
      token: 'usdc',
      account: '0x',
      spender: '0x',
    })
    extended.token.getAllowance.call({
      token: 'usdc',
      account: '0x',
      spender: '0x',
    })
    extended.token.getBalance({ token: 'usdc', account: '0x' })
    extended.token.getBalance({ token: 'usdc' })
    extended.token.getTotalSupply({ token: 'usdc' })
  })

  test('selects by `token` address', () => {
    extended.token.getAllowance({
      token: '0x',
      account: '0x',
      spender: '0x',
    })
    extended.token.getMetadata({ token: '0x' })
    extended.token.getBalance({ token: '0x', account: '0x' })
  })

  test('getAllowance uses `account` for the token owner', () => {
    extended.token.getAllowance({
      token: 'usdc',
      // @ts-expect-error - use `account`, not `owner`
      owner: '0x',
      spender: '0x',
    })
  })

  test('getMetadata does not accept a decimals override', () => {
    extended.token.getMetadata({
      token: 'usdc',
      // @ts-expect-error - metadata reads token decimals
      decimals: 6,
    })
  })

  test('getBalance returns base units + formatted', async () => {
    const balance = await extended.token.getBalance({
      token: 'usdc',
      account: '0x',
    })
    expectTypeOf(balance).toEqualTypeOf<{
      amount: bigint
      decimals: number
      formatted: string
    }>()
  })

  test('getTotalSupply returns base units + formatted', async () => {
    const totalSupply = await extended.token.getTotalSupply({ token: 'usdc' })
    expectTypeOf(totalSupply).toEqualTypeOf<{
      amount: bigint
      decimals: number
      formatted: string
    }>()
  })
})
