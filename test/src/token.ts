import { Client, http, testActions } from 'viem'
import { mainnet } from 'viem/chains'
import { usdc as usdcToken } from 'viem/tokens'

import * as anvil from './anvil.js'

export { accounts } from './constants.js'

/** USD Coin (USDC) on Ethereum mainnet. */
export const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as const

/** Decimals for USDC. */
export const decimals = 6

/** An address holding USDC on the mainnet fork. */
export const holder = '0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078' as const

/** Mainnet-fork Client declaring `usdc` on its `tokens` array. */
export const client = Client.create({
  chain: mainnet,
  tokens: [usdcToken],
  transport: http(anvil.mainnet.rpcUrl.http),
})

/** Test-action Client for the mainnet fork (mining, impersonation, balances). */
export const testClient = client.extend(testActions())

/**
 * Impersonates `address` and funds it with ETH so it can send transactions on
 * the mainnet fork.
 */
export async function prepareAccount(address: `0x${string}`) {
  await testClient.address.impersonate({ address })
  await testClient.address.setBalance({
    address,
    value: 10000000000000000000000n,
  })
}
