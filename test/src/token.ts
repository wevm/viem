import { impersonateAccount } from '../../src/actions/test/impersonateAccount.js'
import { mine } from '../../src/actions/test/mine.js'
import { setBalance } from '../../src/actions/test/setBalance.js'
import { mainnet } from '../../src/chains/definitions/mainnet.js'
import type { Address } from '../../src/index.js'
import { wait } from '../../src/utils/wait.js'
import { anvilMainnet } from './anvil.js'
import { accounts, address } from './constants.js'

export { accounts }

export const client = anvilMainnet.getClient()

export const usdc = mainnet.tokens.usdc.address
export const decimals = 6
export const holder = address.usdcHolder

/** Impersonates `address` and funds it with ETH so it can send transactions. */
export async function prepareAccount(address: Address) {
  await impersonateAccount(client, { address })
  await setBalance(client, { address, value: 10n ** 20n })
}

/**
 * Awaits a `*Sync` action, mining blocks until it resolves. The mainnet anvil
 * runs with `noMining`, so a sync action that waits for its receipt would hang
 * without a block being produced.
 */
export async function mined<value>(action: Promise<value>): Promise<value> {
  let settled = false
  const result = action.finally(() => {
    settled = true
  })
  while (!settled) {
    await mine(client, { blocks: 1 })
    await wait(100)
  }
  return result
}
