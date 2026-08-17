import type { Address } from 'abitype'
import type { MultisigConfig } from 'ox/tempo'
import { BaseError } from '../../errors/base.js'
import { ContractFunctionRevertedError } from '../../errors/contract.js'
import type { MultisigAccount } from '../Account.js'
import type { MultisigOwnerState } from '../Transaction.js'

/** @internal */
export function createMultisigStateResolver(
  getConfig: (account: Address) => Promise<{
    owners: MultisigConfig.Config['owners']
    threshold: MultisigConfig.Config['threshold']
    version: bigint
  }>,
) {
  // Cache only within one operation because config versions can change between requests.
  const cache = new Map<Address, Promise<MultisigOwnerState>>()
  return (account: Address): Promise<MultisigOwnerState> => {
    const address = account.toLowerCase() as Address
    const cached = cache.get(address)
    if (cached) return cached

    const state = (async () => {
      try {
        const config = await getConfig(account)
        return {
          account,
          config: { owners: config.owners, threshold: config.threshold },
          initialized: true,
          version: config.version,
        }
      } catch (error) {
        const cause =
          error instanceof BaseError
            ? error.walk(
                (error) => error instanceof ContractFunctionRevertedError,
              )
            : undefined
        if (
          !(cause instanceof ContractFunctionRevertedError) ||
          cause.data?.errorName !== 'NotMultisigAccount'
        )
          throw error
        return { account, initialized: false, version: 0n }
      }
    })()
    cache.set(address, state)
    return state
  }
}

/** @internal */
export function getMultisigOwnerStates(
  account: MultisigAccount,
  getState: (account: Address) => Promise<MultisigOwnerState>,
): Promise<readonly MultisigOwnerState[]> {
  // Collect locally first so all config reads start in one latency wave.
  const owners: MultisigAccount[] = [account]
  const seen = new Set<Address>([account.address.toLowerCase() as Address])
  const visit = (account: MultisigAccount) => {
    for (const owner of account.owners) {
      if (owner.source !== 'multisig') continue
      const address = owner.address.toLowerCase() as Address
      if (seen.has(address)) continue
      seen.add(address)
      owners.push(owner as MultisigAccount)
      visit(owner as MultisigAccount)
    }
  }
  visit(account)
  return Promise.all(owners.map((owner) => getState(owner.address)))
}
