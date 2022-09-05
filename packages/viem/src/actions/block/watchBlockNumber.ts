import { NetworkProvider, WalletProvider } from '../../providers'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import { FetchBlockNumberResponse, fetchBlockNumber } from './fetchBlockNumber'

export type WatchBlockNumberArgs = {
  /** Whether or not to emit the latest block to the callback when the subscription opens. */
  emitOnOpen?: boolean
  /** Polling frequency (in ms). Defaults to provider's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlockNumberResponse = FetchBlockNumberResponse
export type WatchBlockNumberCallback = (
  blockNumber: WatchBlockNumberResponse,
) => void

export function watchBlockNumber(
  provider: NetworkProvider | WalletProvider,
  callback: WatchBlockNumberCallback,
  {
    emitOnOpen = false,
    pollingInterval: pollingInterval_,
  }: WatchBlockNumberArgs = {},
) {
  const blockTime =
    provider.type === 'networkProvider' ? provider.chain.blockTime : undefined
  const pollingInterval =
    pollingInterval_ ?? (blockTime || provider.pollingInterval)
  const observerId = JSON.stringify(['watchBlockNumber', provider.uniqueId])

  return observe<WatchBlockNumberCallback, WatchBlockNumberResponse>(
    observerId,
    callback,
  )(({ emit }) =>
    poll(() => fetchBlockNumber(provider), {
      emitOnOpen,
      onData: emit,
      interval: pollingInterval,
    }),
  )
}
