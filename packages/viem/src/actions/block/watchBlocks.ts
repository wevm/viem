import { NetworkProvider, WalletProvider } from '../../providers'
import { BlockTag } from '../../types/ethereum-provider'
import { subscribe } from '../../utils/subscribe'
import { wait } from '../../utils/wait'
import { FetchBlockResponse, fetchBlock } from './fetchBlock'

export type WatchBlocksArgs = {
  /** The block tag. Defaults to "latest". */
  blockTag?: BlockTag
  /** Whether or not to emit the latest block to the callback when the subscription opens. */
  emitOnOpen?: boolean
  /** Whether or not to include transaction data in the response. */
  includeTransactions?: boolean
  /** Polling frequency (in ms). Defaults to provider's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlocksResponse = FetchBlockResponse
export type WatchBlocksCallback = (block: WatchBlocksResponse) => void

export function watchBlocks(
  provider: NetworkProvider | WalletProvider,
  callback: WatchBlocksCallback,
  {
    blockTag = 'latest',
    emitOnOpen = false,
    includeTransactions = false,
    pollingInterval: pollingInterval_,
  }: WatchBlocksArgs = {},
) {
  const blockTime =
    provider.type === 'networkProvider' ? provider.chain.blockTime : undefined
  const pollingInterval =
    pollingInterval_ ?? (blockTime || provider.pollingInterval)
  return pollBlocks(provider, callback, {
    blockTag,
    emitOnOpen,
    includeTransactions,
    pollingInterval,
  })
}

////////////////////////////////////////////////////////////
// Polling

function pollBlocks(
  provider: NetworkProvider | WalletProvider,
  callback: WatchBlocksCallback,
  {
    blockTag,
    emitOnOpen,
    includeTransactions,
    pollingInterval,
  }: Required<WatchBlocksArgs>,
) {
  const cacheKey = JSON.stringify([provider.uniqueId, includeTransactions])
  return subscribe<WatchBlocksCallback, WatchBlocksResponse>(
    cacheKey,
    callback,
  )(({ emit }) => {
    let active = true

    const fetchBlock_ = () => {
      return fetchBlock(provider, {
        blockTag,
        includeTransactions,
      })
    }

    // We are going to fetch the latest block, and then use
    // that to calculate the time to fetch the next block.
    fetchBlock_().then(async (block) => {
      if (!active) return

      if (emitOnOpen) emit(block)

      // In order to keep in sync, we need to find the time
      // to wait to fetch the next block.
      const waitTime =
        pollingInterval - (Number(new Date()) - Number(block.timestamp * 1000n))

      // If the wait time is between the polling interval time, we will wait that
      // time and then fetch the next block. Otherwise, we are expecting a
      // new block so we will fetch immediately.
      if (waitTime > 0 && waitTime < pollingInterval) {
        await wait(waitTime)
      }

      const poll = async () => {
        if (!active) return
        const block = await fetchBlock_()
        emit(block)
        await wait(pollingInterval)
        poll()
      }

      poll()
    })

    return () => (active = false)
  })
}
