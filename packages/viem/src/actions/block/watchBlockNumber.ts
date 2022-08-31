import { NetworkProvider, WalletProvider } from '../../providers'
import { subscribe } from '../../utils/subscribe'
import { wait } from '../../utils/wait'
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
  return pollBlockNumber(provider, callback, {
    emitOnOpen,
    pollingInterval,
  })
}

////////////////////////////////////////////////////////////
// Polling

function pollBlockNumber(
  provider: NetworkProvider | WalletProvider,
  callback: WatchBlockNumberCallback,
  { emitOnOpen, pollingInterval }: Required<WatchBlockNumberArgs>,
) {
  const cacheKey = JSON.stringify([provider.uniqueId])
  return subscribe<WatchBlockNumberCallback, WatchBlockNumberResponse>(
    cacheKey,
    callback,
  )(({ emit }) => {
    let active = true

    const fetchBlockNumber_ = () => {
      return fetchBlockNumber(provider)
    }

    fetchBlockNumber_().then(async (blockNumber) => {
      if (!active) return

      if (emitOnOpen) emit(blockNumber)

      const poll = async () => {
        if (!active) return
        const block = await fetchBlockNumber_()
        emit(block)
        await wait(pollingInterval)
        poll()
      }

      poll()
    })

    return () => (active = false)
  })
}
