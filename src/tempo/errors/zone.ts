import { BaseError } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'

type ZoneChainLike = Chain & { zones: Record<number, unknown> }

export type ZoneNotConfiguredErrorType = ZoneNotConfiguredError & {
  name: 'ZoneNotConfiguredError'
}
export class ZoneNotConfiguredError extends BaseError {
  constructor({ chain, zoneId }: { chain: ZoneChainLike; zoneId: number }) {
    super(`Zone "${zoneId}" is not configured on chain "${chain.name}".`, {
      metaMessages: [
        `Chain ID: ${chain.id}`,
        `Configured Zones: ${Object.keys(chain.zones).join(', ') || 'none'}`,
      ],
      name: 'ZoneNotConfiguredError',
    })
  }
}

export type ZoneRpcUrlNotConfiguredErrorType = ZoneRpcUrlNotConfiguredError & {
  name: 'ZoneRpcUrlNotConfiguredError'
}
export class ZoneRpcUrlNotConfiguredError extends BaseError {
  constructor({ chain, zoneId }: { chain: ZoneChainLike; zoneId: number }) {
    super(
      `Zone "${zoneId}" on chain "${chain.name}" does not have an HTTP RPC URL configured.`,
      {
        metaMessages: [`Chain ID: ${chain.id}`],
        name: 'ZoneRpcUrlNotConfiguredError',
      },
    )
  }
}
