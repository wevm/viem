import { PublicKey } from 'ox'
import type { Address, Block, Errors, Hex, StateOverrides } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { multicall } from '../../../core/actions/multicall.js'
import { defineCall } from '../../internal/utils.js'
import * as ZoneAbis from '../../zones/Abis.js'
import { getPortalAddress } from '../../zones/zone.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Gets the active sequencer encryption key for a zone.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const { keyIndex, publicKey } = await Actions.zone.getEncryptionKey(client, {
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The active encryption key and its zero-based index.
 */
export async function getEncryptionKey<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getEncryptionKey.Options,
): Promise<getEncryptionKey.ReturnType> {
  const chain = client.chain
  if (!chain) throw new Error('`chain` is required.')

  const { portalAddress: portalAddress_, zoneId, ...rest } = options
  const portalAddress = portalAddress_ ?? getPortalAddress(chain.id, zoneId)
  const { results } = await multicall(client, {
    ...rest,
    allowFailure: true,
    batchSize: 0,
    calls: getEncryptionKey.calls({ portalAddress }),
    deployless: true,
    mode: 'multicall',
  })

  const [keyCountResult, publicKeyResult] = results
  if (keyCountResult.status === 'failure') throw keyCountResult.error
  const keyCount = keyCountResult.result
  if (keyCount === 0n || publicKeyResult.status === 'failure')
    throw keyCount === 0n
      ? new Error('No sequencer encryption key configured.')
      : publicKeyResult.error

  const [x, prefix] = publicKeyResult.result
  PublicKey.assert({ prefix, x }, { compressed: true })
  return {
    keyIndex: keyCount - 1n,
    publicKey: { prefix: prefix as 2 | 3, x },
  }
}

export namespace getEncryptionKey {
  /** Arguments used to resolve a zone encryption key. */
  export type Args = {
    /** Zone portal address. Defaults to the configured portal registry. */
    portalAddress?: Address.Address | undefined
    /** Zone ID. */
    zoneId: number
  }
  /** Options for {@link getEncryptionKey}. */
  export type Options = Args & {
    /** Account attached to the contract reads. */
    account?: Account.Account | Address.Address | undefined
    /** Per-request transport options. */
    requestOptions?: RequestOptions
    /** State overrides applied to the contract reads. */
    stateOverride?: StateOverrides.StateOverrides | undefined
  } & (
      | {
          /** Block number to read against. */
          blockNumber?: bigint | undefined
          blockTag?: undefined
        }
      | {
          blockNumber?: undefined
          /** Block tag to read against. Defaults to `latest`. */
          blockTag?: Block.Tag | undefined
        }
    )
  /** Return value for {@link getEncryptionKey}. */
  export type ReturnType = {
    /** Zero-based encryption key index. */
    keyIndex: bigint
    /** Active sequencer encryption public key. */
    publicKey: {
      /** SEC1 compressed public key prefix. */
      prefix: 2 | 3
      /** Public key x-coordinate. */
      x: Hex.Hex
    }
  }
  /** Error type for {@link getEncryptionKey}. */
  export type ErrorType =
    | multicall.ErrorType
    | PublicKey.assert.ErrorType
    | Errors.GlobalErrorType

  /** Defines calls to the encryption key count and active sequencer key. */
  export function calls(args: { portalAddress: Address.Address }) {
    return [
      defineCall({
        address: args.portalAddress,
        abi: ZoneAbis.zonePortal,
        functionName: 'encryptionKeyCount',
      }),
      defineCall({
        address: args.portalAddress,
        abi: ZoneAbis.zonePortal,
        functionName: 'sequencerEncryptionKey',
      }),
    ] as const
  }
}
