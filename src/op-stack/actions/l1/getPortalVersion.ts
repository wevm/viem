import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { withCache } from '../../../core/internal/promise.js'
import { portal2Abi } from '../../abis.js'
import { type ContractParameters, getContractAddress } from './internal.js'

/** Retrieves the deployed OP Stack portal version. */
export async function getPortalVersion<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getPortalVersion.Options,
): Promise<getPortalVersion.ReturnType> {
  const chain = options.chain ?? client.chain
  const address = getContractAddress({ ...options, chain }, 'portal')
  const version = await withCache(
    () =>
      read(client, {
        abi: portal2Abi,
        address,
        functionName: 'version',
      }),
    {
      cacheKey: `opStack.portalVersion.${client.uid}.${address}`,
      cacheTime: 300,
    },
  )
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)
  return { major, minor, patch }
}

export declare namespace getPortalVersion {
  /** Options for {@link getPortalVersion}. */
  type Options = ContractParameters<'portal'> & {
    /** Chain used to resolve the portal address. @default client.chain */
    chain?: Chain.Chain | undefined
  }

  /** Parsed semantic version. */
  type ReturnType = {
    /** Major version. */
    major: number
    /** Minor version. */
    minor: number
    /** Patch version. */
    patch: number
  }

  /** Errors thrown by {@link getPortalVersion}. */
  type ErrorType =
    | read.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
