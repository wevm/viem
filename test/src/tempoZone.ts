import type { Address } from 'ox'
import { Chain } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, ZoneId } from 'viem/tempo'
import { http } from 'viem/tempo/zones'

import * as tempo from './tempo.js'

const runtime = process.env.OFFLINE
  ? undefined
  : await tempo.zone.start()

/** Runtime zone ID. */
export const zoneId = runtime?.zoneId ?? 1

/** Runtime zone factory address. */
export const factoryAddress = runtime?.factoryAddress

/** Runtime zone portal address. */
export const portalAddress = runtime?.portalAddress

/** Runtime zone chain. */
export const chain = Chain.from({
  ...tempoLocalnet,
  id: runtime?.chainId ?? ZoneId.toChainId(zoneId),
  name: `Tempo Zone ${zoneId} (Local)`,
  nativeCurrency: {
    decimals: 6,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    http: runtime?.privateRpcUrl ?? 'http://127.0.0.1:0',
  },
  sourceId: tempoLocalnet.id,
  supportsTransactionReplacementDetection: false,
})

/** Creates a Client connected to the runtime zone. */
export function getClient(options: getClient.Options = {}) {
  return Client.create({
    account: options.account,
    chain,
    pollingInterval: 100,
    transport: http(),
  })
}

export namespace getClient {
  /** Options for {@link getClient}. */
  export type Options = {
    /** Account for the Client. */
    account?: Account.Account | Address.Address | undefined
  }
}
