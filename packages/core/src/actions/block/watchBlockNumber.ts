import { AccountProvider } from '../../providers/account'
import { NetworkProvider } from '../../providers/network'
import { WalletProvider } from '../../providers/wallet'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import { FetchBlockNumberResponse, fetchBlockNumber } from './fetchBlockNumber'

export type WatchBlockNumberArgs = {
  /** Whether or not to emit the latest block to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Polling frequency (in ms). Defaults to provider's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlockNumberResponse = FetchBlockNumberResponse
export type WatchBlockNumberCallback = (
  blockNumber: WatchBlockNumberResponse,
) => void

export function watchBlockNumber(
  provider: NetworkProvider | WalletProvider | AccountProvider,
  callback: WatchBlockNumberCallback,
  {
    emitOnBegin = false,
    pollingInterval: pollingInterval_,
  }: WatchBlockNumberArgs = {},
) {
  const blockTime =
    provider.type === 'networkProvider' ? provider.chain.blockTime : undefined
  const pollingInterval =
    pollingInterval_ ?? (blockTime || provider.pollingInterval)
  const observerId = JSON.stringify(['watchBlockNumber', provider.uid])

  return observe<WatchBlockNumberCallback, WatchBlockNumberResponse>(
    observerId,
    callback,
  )(({ emit }) =>
    poll(() => fetchBlockNumber(provider), {
      emitOnBegin,
      onData: emit,
      interval: pollingInterval,
    }),
  )
}
